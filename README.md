# linteffect Oxlint plugin

Oxlint plugin rules for Effect TypeScript code-shape constraints.

### Effect Version Status

The unreleased `2.0.0` migration makes default exports Effect 4 policy and adds
`effect3` for legacy projects. The configuration foundation is implemented;
the complete Effect 4 detector and repair corpus is **not yet qualified**.
Published 1.x packages retain their original Effect 3 behaviour and do not
provide the new namespace. See the [compatibility roadmap](roadmap/14-effect4-compatibility/README.md)
and [per-rule audit](docs/effect-version-inventory.json) before using this checkout.
The staged major changeset and outstanding publication gates are tracked in the
[2.0.0 release checklist](docs/superpowers/reports/2026-10-01-effect4-release-preparation.md).

`bun run test:effect-versions` verifies pinned packed Effect 3.21.4 and 4.0.0
consumers, with exact warning counts, clean controls and config typechecks.
The initial probes qualify documented variants of `no-effect-fail-error-message`,
`no-catchall-generic-rethrow`, `no-early-catchall-null` and
`no-run-effect-outside-boundary`; accepting a version option is not proof that a
pending detector has been adapted. `release` and `prepublishOnly` are blocked until a major bump and
all applicable major-specific inventory entries qualify.

Additional group-by-group evidence is tracked in the
[wider qualification report](docs/superpowers/reports/2026-10-01-effect4-complete-qualification.md)
and both consumers' `qualification-cases.json`. Each case requires annotated bad
sources, passing clean controls and literal per-file diagnostic counts. Run
`bun scripts/verify-effect-version-consumers.ts --require-complete` after a build
to reject any remaining unqualified applicable rule; it currently rejects this
unfinished campaign.

## Install

```bash
bun add -d oxlint @opsydyn/oxlint-effect
```

## Configure

```ts
import { defineConfig } from "oxlint";
import { recommended } from "@opsydyn/oxlint-effect";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [...recommended.jsPlugins],
  rules: recommended.rules,
});
```

`recommended.jsPlugins` is exported as a readonly tuple. Spreading it creates
the mutable array shape expected by Oxlint's `ExternalPluginEntry[]` config
type.

### Configure Legacy Effect 3

Every group and its rules-only companion is available under `effect3` in the
unreleased 2.0 configuration. Default `ddd` targets Effect 4; legacy projects use:

```ts
import { defineConfig } from "oxlint";
import { effect3 } from "@opsydyn/oxlint-effect";

export default defineConfig({
  jsPlugins: [...effect3.ddd.jsPlugins],
  rules: effect3.ddd.rules,
});
```

For rules-only composition, use `effect3.domainModelingRules` and
`effect3.errorModelingRules`. The namespace also includes `recommended`,
`recommendedRules`, `allRules`, `ruleGroups`, `presets`, `typeAware` and `jsPlugins`.
No second plugin registration is needed. `effect3.typeAware` remains opt-in.

Version-sensitive rule entries are tuples with `effectVersion: 3 | 4`.
Manually enabling a sensitive rule without options selects 4. When customising
severity or paths, specify the major explicitly rather than discarding it:

```ts
export default defineConfig({
  jsPlugins: [...effect3.jsPlugins],
  rules: {
    ...effect3.dddRules,
    "linteffect/no-early-catchall-null": [
      "warn",
      { effectVersion: 3, boundaryPaths: ["src/http/**", "test/**"] },
    ],
  },
});
```

For Effect 4 manual policy, use `["error", { effectVersion: 4 }]`. Ordinary Oxlint
override/merge rules apply; there is no process-wide version detection.
Version-neutral rules keep severity-only entries and existing options.
`allRules` includes all rules applicable to the selected major, not every
registered rule. The five currently identified v3-only rules remain registered
and available in `effect3`: `require-service-accessors`,
`require-service-dependencies`, `no-effect-async`, `no-effect-orElse-ladder` and
`no-fromnullable-nullish-coalesce`. The audit may identify further restrictions.

### Recovery And Runtime Across Majors

In the unreleased 2.0 checkout, the plain-recovery rules recognise `Effect.catch`
for Effect 4 and `Effect.catchAll` under `effectVersion: 3`. IDs retain `catchall`
for configuration stability. Both direct and piped operators, expression
callbacks and block returns are covered. Original structured errors and explicit
tagged mappings remain clean; Cause, defect, filtered and reason handlers are
not treated as plain recovery. A legacy spelling under v4 is not a migration
warning.

`no-run-effect-outside-boundary` covers `runCallback`, `runFork`, `runPromise`,
`runPromiseExit`, `runSync` and `runSyncExit`. Effect 4 additionally covers their
six `With` forms at execution: `Effect.runPromiseWith(context)(program)`.
`Effect.runPromiseWith(context)` alone creates a runner and does not warn.
Stored runner aliases, renamed imports and computed properties are not covered.

The runner rule now honours `boundaryPaths` for both majors, correcting its old
behaviour of warning even at boundaries. It shares these conservative defaults
with early fallback recovery: `bin/**`, `scripts/**`, `cli/**`, `**/main.ts`,
`app/api/**/route.ts`, `server/**`, `*.test.ts`, `*.spec.ts`. Custom paths **replace**
defaults; `[]` exempts nothing. Keep `effectVersion` in custom option tuples:

```ts
"linteffect/no-run-effect-outside-boundary": [
  "warn",
  { effectVersion: 3, boundaryPaths: ["src/http/**", "test/**"] },
],
```

Return an Effect from domain logic, preserve structured failures, and execute or
recover at your configured boundary. A context-supplied runner is not evidence
of missing Layer provision; syntax cannot prove context completeness.
See annotated [Effect 4 failures](examples/effect4-consumer/src/recovery-runtime/runners.ts),
[legacy recovery failures](examples/effect3-consumer/src/recovery-runtime/rethrow.ts)
and the [qualification report](docs/superpowers/reports/2026-10-01-effect4-recovery-runtime-qualification.md).

### Configure Type-Aware Linting

`typeAware` is an opt-in configuration bridge to [Oxc's type-aware
linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html). It preserves
the package's recommended syntax-only `linteffect/*` rules and enables Oxc's
type-aware engine, but it does not select any `typescript/*` rules or enable
`typeCheck` compiler diagnostics.

Install the type-aware engine in the consuming project:

```bash
bun add -d oxlint oxlint-tsgolint @opsydyn/oxlint-effect
```

The current engine requires TypeScript 7. Keep `oxlint`, `oxlint-tsgolint`,
TypeScript, and the consumer's project configuration compatible. In a
monorepo, build dependent packages so their declarations can be resolved
before type-aware linting runs.

```ts
import { defineConfig } from "oxlint";
import { typeAware } from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  rules: {
    ...typeAware.rules,
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
  },
});
```

`options.typeAware` must be at the root of the resolved Oxlint configuration;
do not place it in an override or nested configuration object. The package
uses only that option. The two `typescript/*` entries above are selected by the
consumer; `typeAware.rules` itself does not include them. Consumers may also
separately opt into compiler diagnostics:

```bash
oxlint --type-aware
```

```ts
export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
```

The CLI enables the same type-aware engine without this package preset. The
second configuration is consumer-owned and is not part of `typeAware`.

The package's custom Effect rules remain syntax-only. Oxc's [JavaScript plugin
API](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) does not support
custom type-aware rules, so semantic Effect rules remain deferred until Oxc
provides supported typed-plugin access.

### Configure One Rule Group

Every named preset in the following table is exported as a config-shaped preset
with the same shape as `recommended`; use the same mutable-array workaround
for each one. For example, the `ddd` preset combines Domain Modeling and Error
Modeling rules:

```ts
import { defineConfig } from "oxlint";
import { ddd } from "@opsydyn/oxlint-effect";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [...ddd.jsPlugins],
  rules: ddd.rules,
});
```

Named group presets:

| Preset | Rule Group |
| --- | --- |
| `reactAndRuntimeBoundaries` | React and Runtime Boundaries |
| `effectComposition` | Effect Composition |
| `concurrencySafety` | Concurrency Safety |
| `resourceLifetime` | Resource Lifetime |
| `pipelineShapeAndSequencing` | Pipeline Shape and Sequencing |
| `branchingAndLocalControlFlow` | Branching and Local Control Flow |
| `optionMatchAndDataNormalization` | Option, Match, and Data Normalization |
| `atomStateAndPlatformBoundaries` | Atom, State, and Platform Boundaries |
| `domainModeling` | Domain Modeling |
| `errorModeling` | Error Modeling |
| `ddd` | Domain Modeling and Error Modeling |
| `effectFlow` | Effect Flow |
| `pureTransformation` | Pure Transformation |
| `behaviorDecoration` | Behavior Decoration |
| `styleSeparation` | Style Separation |
| `serviceAndLayerArchitecture` | Service and Layer Architecture |
| `platformAndBoundaryHygiene` | Platform and Boundary Hygiene |
| `testingObservabilityAndQa` | Testing, Observability, and QA |

Each preset also has a rule-only export with a `Rules` suffix. Use those when
you want to compose multiple groups. Compose `typeAware` with rule-only exports when a type-aware configuration needs
additional Effect policy:

```ts
import { defineConfig } from "oxlint";
import {
  typeAware,
  domainModelingRules,
  errorModelingRules,
} from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  rules: {
    ...typeAware.rules,
    ...domainModelingRules,
    ...errorModelingRules,
  },
});
```

For local development inside this repository, point `jsPlugins` at the TypeScript source:

```ts
import { defineConfig } from "oxlint";
import { allRules } from "./src/index";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [{ name: "linteffect", specifier: "./src/index.ts" }],
  rules: allRules,
});
```

## Agent Skill

The companion `oxlint-effect` skill helps coding agents configure the npm
plugin, diagnose DDD warnings, and repair domain models when requested.

Its existing assets currently target Effect 3. They are legacy controls during
the v4 migration, not qualified v4 repairs; select `effect3` for their lint QA.

```bash
npx skills add opsydyn/oxlint-effect --skill oxlint-effect
```

Ask your agent to configure a selected group, explain a `linteffect` warning,
or repair a domain-modeling issue. The skill preserves existing configuration
and uses the installed package's APIs and rules. Type-aware linting is opt-in.
Intentional `EXPECT`/`QA` failures are retained as diagnostic controls.

The [skill](./skills/oxlint-effect/SKILL.md), its focused references, and
paired [failures](./skills/oxlint-effect/assets/domain.bad.ts) and
[repairs](./skills/oxlint-effect/assets/domain.good.ts) are also included in the
npm package under `skills/oxlint-effect`. Skill installation is separate from
npm installation; installing the plugin alone does not activate agent guidance.

The initial examples cover branded IDs, explicit notification modes, and
structured transfer errors. Additional paired [domain shape failures](./skills/oxlint-effect/assets/domain-shapes.bad.ts)
and [repairs](./skills/oxlint-effect/assets/domain-shapes.good.ts) cover typed
commands, epoch-millisecond time values, and schema-backed options. Their tests
check wire roundtrips, optional fields, invalid inputs, and rejected type misuse.
Paired [domain decision failures](./skills/oxlint-effect/assets/domain-decisions.bad.ts)
and [repairs](./skills/oxlint-effect/assets/domain-decisions.good.ts) cover status
variants, business predicates, and explicit lifecycle states. Their tests check
the original decision results, legacy flag roundtrips, and valid/invalid
transitions. The [decision guide](./skills/oxlint-effect/references/domain-decisions.md)
documents the example's boundary and lifecycle policies.
Paired [domain context failures](./skills/oxlint-effect/assets/domain-context.bad.ts)
and [repairs](./skills/oxlint-effect/assets/domain-context.good.ts) cover explicit
policy requirements, modelled time inputs, and meaningful error payloads. The
[context guide](./skills/oxlint-effect/references/domain-context.md) distinguishes
typed identity from authority and time conversion from clock reads.
Paired [public error failures](./skills/oxlint-effect/assets/public-errors.bad.ts)
and [repairs](./skills/oxlint-effect/assets/public-errors.good.ts) cover generic,
unknown, and mixed public error channels. The
[public error guide](./skills/oxlint-effect/references/public-errors.md) explains
cause preservation, selective recovery, caller migration and defect ownership.
Paired [error preservation failures](./skills/oxlint-effect/assets/error-preservation.bad.ts)
and [repairs](./skills/oxlint-effect/assets/error-preservation.good.ts) cover
message-only failures, generic rethrows and log-only handlers. The
[preservation guide](./skills/oxlint-effect/references/error-preservation.md)
explains recovery ownership and the `catchAll`/`tapError` distinction.
Paired [expected-state failures](./skills/oxlint-effect/assets/expected-state.bad.ts)
and [repairs](./skills/oxlint-effect/assets/expected-state.good.ts) cover ordinary
absence, broad null recovery and thrown expected rejection. Their
[guide](./skills/oxlint-effect/references/expected-state.md) explains the required
caller changes. The corpus now covers all 21 exported DDD rules with representative
annotated failures, full-DDD clean controls and tested contracts.
CI checks referenced rules and presets, relative
links, npm inclusion, TypeScript contracts, intentional diagnostics, and clean
DDD repairs. This validates the examples and package contract, not the quality
of every agent-generated repair.

## Rule Groups

The recommended config enables the broadly applicable rules as errors. Strict
groups can add more opinionated checks where a team has adopted the associated
workflow. The rules are heuristic: they flag code shapes that tend to hide
Effect flow, domain meaning, or runtime boundaries.

### React and Runtime Boundaries

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-react-state` | React state hooks such as `useState`, `useReducer`, and `useEffect`. | Keeps React UI state in the atom/runtime model instead of bypassing it. |
| `linteffect/no-runtime-runfork` | `Runtime.runFork(...)`. | Detached fibers hide ownership, interruption, and lifecycle boundaries. |
| `linteffect/no-run-effect-outside-boundary` | Six direct `Effect.run*` calls and, in v4, immediate curried `run*With(context)(program)` execution outside configured boundaries. | Keeps runtime ownership at recognised boundaries; context factory creation is clean. |
| `linteffect/no-or-die-outside-boundary` | `Effect.orDie(...)`, `Effect.orDieWith(...)`, and pipe arguments such as `Effect.orDie`. | Prevents recoverable typed failures from being converted to defects inside domain logic. |
| `linteffect/prevent-dynamic-imports` | Dynamic `import(...)`. | Static imports keep dependency boundaries visible. |
| `linteffect/no-render-side-effects` | `Match.value(...).pipe(...)` used as a render-time statement. | Prevents side effects from running during render. |
| `linteffect/no-inline-runtime-provide` | Inline `Effect.provide(...)` inside local runtime/generator chains. | Keeps dependency assembly at service or application boundaries. |

### Effect Composition

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-effect-as` | Direct `Effect.as(...)` wrappers. | Makes value flow explicit instead of discarding meaning behind a placeholder. |
| `linteffect/no-effect-do` | `Effect.Do`. | Avoids builder-style hidden sequencing. |
| `linteffect/no-effect-bind` | `Effect.bind(...)`. | Prefers direct `Effect.gen` or pipeline flow over builder state. |
| `linteffect/no-effect-async` | `Effect.async(...)`. | Manual callback bridges are easy to leak or resume incorrectly. |
| `linteffect/no-effect-ignore` | `Effect.ignore(...)` and pipe arguments such as `Effect.ignore`. | Makes ignored failures explicit at boundaries instead of burying failure ownership. |
| `linteffect/no-effect-never` | `Effect.never`. | Infinite effects should have explicit lifecycle and teardown ownership. |
| `linteffect/no-effect-fn-generator` | `Effect.fn(function* ...)`; v4 also covers named `Effect.fn("name")(function* ...)`. | Returns one explicit `Effect.gen` from a plain function; non-generator `Effect.fn` bodies stay clean. |
| `linteffect/no-nested-effect-gen` | `Effect.gen` nested inside another `Effect.gen`; v4 includes `{ self }` forms. | Keeps generator-based effects linear; v4 excludes separately defined nested functions. |
| `linteffect/no-yield-without-star-in-effect-gen` | Plain `yield` inside `Effect.gen`; v4 includes `{ self }` forms. | Uses `yield*` for resumed-value typing and consistent workflow style. Plain yield can execute in v4; the rule is a delegation-style policy, not an interpreter-failure claim. |
| `linteffect/no-async-effect-combinator-callback` | `async` callbacks passed to supported Effect combinators; v4 includes recovery families and handler maps. | Adapts Promise APIs with `Effect.tryPromise`, then returns Effect steps. Some legacy overloads accept Promises; this rule still requires explicit workflow ownership. |
| `linteffect/no-throw-in-effect-logic` | `throw` inside `Effect.gen` or supported Effect callbacks; v4 includes `{ self }` and recovery maps. | Uses `Effect.fail` for typed domain errors rather than thrown defects; v4 excludes separately defined nested functions. |
| `linteffect/no-try-catch-in-effect-logic` | `try/catch` inside `Effect.gen` or supported Effect callbacks; v4 includes `{ self }` and recovery maps. | Adapts throwing APIs with `Effect.try` and recovers with `catch` (v4), `catchAll` (v3), or `catchTag`. |
| `linteffect/no-promise-api-in-effect-logic` | Static Promise APIs and visible Promise chains inside Effect logic. V4 includes self-bound gen and recovery maps. | Adapts Promise APIs at a boundary. V4 excludes `Effect.catch`/unrelated receivers and cannot resolve stored Promise aliases; v3 retains broad chain-name recognition. |
| `linteffect/no-swallowed-catch-all` | Plain `catch`/`catchEager` expression/block recovery (v4), piped `catchAll` expressions (v3), returning succeed/void/ignore or visibly successful asVoid. | Retains failure or uses an explicit typed domain branch. V4 `asVoid(Effect.fail(error))` stays clean because it preserves failure; legacy asVoid policy is unchanged. |
| `linteffect/no-manual-effect-channels` | Manual `Effect.Effect<...>` and `Layer.Layer<...>` channel types. | Lets Effect infer channels from real composition. |
| `linteffect/no-effect-type-alias` | Type aliases around `Effect.Effect<...>`. | Keeps service surfaces concrete and discoverable. |
| `linteffect/no-public-generic-effect-error` | Exported APIs returning `Effect.Effect<_, Error, _>`. | Public Effect APIs should expose tagged, recoverable domain errors instead of generic `Error`. |

### Effect Flow

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-piped-yield-in-gen` | Two or more `yield* effect.pipe(...)` steps inside one `Effect.gen`. | Keeps decorated effects named before the workflow so generator bodies read as a clear story. |
| `linteffect/no-gen-for-mapping` | Tiny `Effect.gen` blocks that yield once and return a pure transform. | Simple value mapping belongs in `Effect.map` or a named pure transformation, not workflow syntax. |
| `linteffect/prefer-gen-for-workflow` | Pipelines with three or more sequencing combinators such as `Effect.flatMap`, `Effect.andThen`, `Effect.tap`, or `Effect.zipRight`. | Long sequencing pipelines read like imperative workflow; `Effect.gen` makes the happy path explicit. |
| `linteffect/no-business-logic-in-pipe` | Strict: `.pipe(Effect.flatMap(...))` callbacks with branching, service retrieval, or multiple Effect steps. | Keeps workflow decisions in `Effect.gen` and reserves `pipe` for behavior around a completed effect. |

### Pure Transformation

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-large-anonymous-flow` | `flow(...)` expressions with five or more transformation steps. | Large pure pipelines need a domain name so the transformation is reusable and reviewable. |
| `linteffect/no-effect-in-flow` | `Effect.*`, `yield`, `await`, async callbacks, console calls, `Promise`, or runtime access inside `flow(...)`. | `flow()` should stay pure; effectful workflow, retries, logging, and dependency access belong in Effect code. |
| `linteffect/prefer-named-flow` | Non-trivial `flow(...)` expressions passed inline as callback/combinator arguments. | Naming the transformation makes DTO mapping and business calculations explicit instead of anonymous callback logic. |
| `linteffect/prefer-flow-for-pure-pipeline` | Strict: pure nested call towers three calls deep or more. | Names a reusable transformation pipeline instead of burying data flow in nested calls. |

### Behavior Decoration

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/prefer-pipe-for-behavior` | Static decorators whose first argument is a visible Effect call or pipe. V4 includes recovery families/maps and timeoutOption/timeoutOrElse/catchNoSuchElement. | Decorates with `.pipe()`; stored Effect aliases are outside the detector's syntax-local scope. V3 retains catchAll/catchSome/timeoutFail. |
| `linteffect/prefer-decorated-effect-before-gen` | Two or more decorated yields inside one `Effect.gen`; v4 includes `{ self }` and recovery decoration. | Names decorated effects before the workflow. V4 excludes separately defined nested functions; one decorated yield stays below the threshold. |
| `linteffect/no-workflow-in-behavior-pipe` | Pipes that mix behavior decorators with multiple workflow sequencing operators or embedded control flow. | `.pipe()` should answer how an effect behaves, not bury multi-step workflow that belongs in `Effect.gen`. |

### Style Separation

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-mixed-pillar-function` | Function bodies containing three or more pillars: workflow, `flow` transformation, behaviour decoration and Layer construction. V4 includes its recovery operators and `flatMapEager`; legacy spellings remain under `effect3`. | Extract named workflows, transformations, policies and wiring. This syntax-local scan includes nested callbacks, not inferred named references. |
| `linteffect/no-clever-effect-expression` | Expressions with at least two pillars and call depth four or an inline function wrapper. Pillar recognition follows the selected Effect major. | Extract named steps; shallow multi-pillar and deep single-pillar expressions remain clean. |
| `linteffect/prefer-extracted-concept` | Anonymous block callbacks with at least three statements passed to calls in Effect-importing files, including ordinary JS calls. | Name the transformation, policy or workflow before passing it. Named callbacks, expression bodies and two-statement blocks remain clean; this is a syntax heuristic, not Effect type inference. |

### Service and Layer Architecture

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/prefer-effect-service` | Legacy `Context.Tag`/`GenericTag` definitions; v4 also flags removed `Effect.Service` calls. | V4 repair: use `Context.Service` keys/classes, optional `make` and explicit layers. Bare v4 keys are valid. Legacy `effect3` repair remains `Effect.Service`. The historical rule ID is retained. |
| `linteffect/no-layer-provide-in-service-definition` | V4 `Layer.provide` assembly inside inline `Context.Service` `make`, including function builders and class expressions; legacy checks `Effect.Service` class options. | Keep construction focused and move layer assembly to named app/test composition boundaries. Ordinary `Layer.provide`, including piped boundary composition, remains clean. Named builder aliases are not resolved. |
| `linteffect/require-service-accessors` | Legacy `Effect.Service` class options omitting or disabling `accessors: true`. | Legacy-only: generated accessors keep v3 service APIs consistent. Omitted from v4 presets and a no-op under explicit v4 manual policy; never add this option to `Context.Service`. |
| `linteffect/require-service-dependencies` | Legacy `Effect.Service` effect/scoped builders delegating to a `*Service` identifier without a `dependencies` option. | Legacy-only: declare dependency layers or provide them explicitly. This is an option-presence/name heuristic, not graph verification; an empty array passes the syntax check. Omitted and inactive in v4, where dependencies use explicit Layer composition. |
| `linteffect/no-namespace-effect-import` | Namespace imports from `effect` and its subpaths, plus the recognised atom-react package. | Use named imports to keep the surface explicit. Root/subpath controls compile in both majors; local namespace imports stay clean. Atom ecosystem compatibility is audited separately. |
| `linteffect/no-manual-service-object-export` | Named variable exports of `*Service` object literals containing functions or a direct `Effect.fn` builder, including pure methods. | V4 repair: `Context.Service` with explicit layers; legacy repair: `Effect.Service`. Data-only objects, other names, private objects and separately exported aliases stay clean under this syntax-local policy. |
| `linteffect/no-layer-merge-in-request-handler` | `Layer.merge*` or `Layer.provide` inside function declarations whose names end in `Handler`, `Route` or `Request`. | Extract boundary layer assembly. The name/declaration heuristic does not infer framework callback ownership or follow named builders. |
| `linteffect/no-service-method-returning-promise` | V4 Promise annotations, async methods and visible Promise returns in literal shapes constructed by inline `Context.Service.make` using functions, `gen`, generator `fn`, `sync`, `succeed` or pipes. Legacy checks retain their annotation/Promise-API traversal. | Return Effect methods. V4 Promise adapters and unused nested callbacks stay clean; named builders, stored Promise aliases and other opaque construction forms are not inferred. |
| `linteffect/prefer-layer-pipe` | `Layer.provide` towers nested in the input argument; diagnostics point to the inner provide call. | Preserve dependency order using `.pipe(Layer.provide(...), ...)`. Single calls and nesting in the provider argument remain clean under this syntax-local policy. |
| `linteffect/no-inline-layer-provide-in-program` | Direct or piped `Effect.provide` / `Layer.provide` inside `Effect.gen`; v4 also recognises self-bound generators and generator `Effect.fn`, including named forms. | Move assembly outside workflow generators, retaining provider order. V4 inspects the generator's own scope; legacy traversal includes nested callbacks. Named provision aliases are not inferred. |
| `linteffect/prefer-layer-mergeall-for-infrastructure` | A `Layer.merge` call whose argument contains another `Layer.merge`. | Group independent layers with `Layer.mergeAll`; a single binary merge stays clean. This syntax heuristic does not prove dependency independence or authorise flattening dependent providers. |
| `linteffect/no-service-layer-scatter` | The third and each later variable declaration with a `*Layer`/`*Live` name and inline `Layer.provide` or `Effect.provide`, counted per file. | Group layers by concern; two matching declarations stay clean. Names are a heuristic, not type evidence; a multi-declarator declaration counts once, at its first matching declarator. |

### Platform and Boundary Hygiene

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-node-fs-in-effect-code` | `fs`, `node:fs`, `fs/promises`, and `node:fs/promises` imports and module-scope `require()` calls in Effect modules. | Effect code should stay portable and move Node filesystem access behind a platform boundary. |
| `linteffect/no-json-parse-without-schema` | `JSON.parse(...)` in Effect modules without an explicit Effect Schema import. | External JSON must be decoded through a schema at the boundary rather than trusted as an unvalidated value. |
| `linteffect/no-date-now-in-effect` | `Date.now()` within supported Effect construction boundaries. | Time should be supplied through Effect's Clock services so workflows remain deterministic and testable. |
| `linteffect/no-new-date-in-domain-logic` | `new Date(...)` in Effect-importing modules outside configured runtime boundaries. | Domain code should receive time through Clock or a modeled input rather than constructing a wall-clock value directly. |
| `linteffect/no-node-platform-in-shared-code` | Node built-in imports, including `node:*` and bare built-in module names, outside configured boundary paths. | Shared modules should remain portable and obtain platform capabilities through services or explicit application boundaries. |
| `linteffect/no-process-env-direct-read` | Direct and computed `process.env` reads outside configured boundary and configuration paths. | Environment values should be decoded once in a configuration service or Layer rather than read as ambient state. |
| `linteffect/no-hidden-effect-execution` | Direct `Effect.run*` calls in Effect modules outside configured boundary paths. | Reusable code should return Effects and leave runtime execution ownership at an application boundary. |
| `linteffect/no-boundary-try-catch-without-effect-map` | `try`/`catch` blocks in configured boundaries with no direct `Effect.try`, error mapping, recovery, or `Effect.run*` call. | Boundary failure handling should stay in Effect's typed error channel rather than becoming imperative control flow. |

The [paired platform/boundary examples](examples/effect4-consumer/src/qualification/platformAndBoundaryHygiene)
cover direct and contextual runners, native filesystem forms and typed service
repairs. V4 recognises actual `run*With(context)(program)` execution, not factory
creation, and current `Effect.catch`/Cause/reason recovery. Legacy `effect3`
retains `catchAll` handling and advice. Boundary catch policy has no Effect import
gate and checks visible marker presence, not whether handling executes; unused
callbacks can suppress it. Hidden execution requires an Effect ecosystem import;
aliased runners stay opaque. Filesystem policy has no boundary exemption and
retains its function-local `require` gap. V3 filesystem repairs use
`@effect/platform/FileSystem`; v4 uses `effect/FileSystem` (or the root export).
No-op FileSystem Layers demonstrate the service seam, not native cancellation.

The same examples cover JSON codecs, Clock and platform services. Legacy codecs
use `Schema.parseJson` with `Schema.decodeUnknown`; v4 uses
`Schema.fromJsonString` with `Schema.decodeUnknownEffect`. Schema import presence
(including aliases and type-only imports) suppresses raw-parse warnings, but does
not establish that decoding occurred. Current clock policy includes
`Effect.fnUntraced` and `fnUntracedEager`; legacy selection preserves its existing
gap. Unused nested callbacks can still warn, while named callbacks and clock
aliases remain opaque. TestClock repairs demonstrate deterministic time rather
than renaming wall-clock access. Shared-platform policy needs no Effect import,
reports type-only Node imports, and does not inspect `require`; configure genuine
application boundaries or depend on typed services.

Environment examples cover direct/computed/optional reads, whole-object access,
configuration paths and typed integer providers. V3 uses `Config.integer` with
`ConfigProvider.fromMap`; v4 uses `Config.Int` with
`ConfigProvider.fromUnknown`. Both `boundaryPaths` and `configPaths` replace
defaults, and empty arrays remove exemptions. This literal-name policy needs no
Effect import: a local object named `process` and `delete` can warn, while imported
aliases, destructured process objects and compound assignments retain gaps.
Runtime controls restore their private environment keys and show that injected
configuration remains stable when ambient state changes, rejecting missing or
malformed values through Effect.

### Testing, Observability, and QA

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-console-in-effect-flow` | `console.*` inside direct `Effect.gen`, `Effect.sync`, `Effect.try`, `Effect.tryPromise`, or `Effect.fn` callbacks, and `Effect.Service` implementations. | Logging through Effect preserves the runtime's observability context. |
| `linteffect/no-effect-log-without-structured-context` | String-only `Effect.logError` and `Effect.logWarning` calls in direct error-handler callbacks or `Effect.Service` implementations. | Failure logs need an error, structured fields, or local `Effect.annotateLogs(...)` context for correlation. |
| `linteffect/require-span-on-public-service-method` | Exported functions or function-valued variables with an explicit `Effect.Effect` return (on the function or variable declaration), plus `Effect.Service` methods directly returning an Effect, when any direct Effect return lacks `Effect.withSpan(...)`. | Public operations need visible trace boundaries. |
| `linteffect/no-runpromise-in-non-async-test-body` | Discarded direct `Effect.runPromise(...)` calls in `*.test.*`, `*.spec.*`, and `__tests__` files. | Tests must await or return runtime execution so the framework observes completion. |
| `linteffect/require-effect-flip-for-error-test` | Direct `await expect(Effect.runPromise(effect)).rejects...` assertions in conventional test files. | An expected typed Effect failure is clearer when `Effect.flip` yields the error as a value for structural assertions. |
| `linteffect/no-test-mock-layer-when-default-available` | A direct `Layer.succeed(...)` or `Layer.effect(...)` sibling of `SomeService.Default` in the same `Layer.provide(...)` call. | An explicit default composition and a sibling replacement layer can hide which service contract the test exercises. |

These rules are deliberately syntax-only. They require an Effect ecosystem import;
they do not resolve aliases, infer Effect return types, or follow values through
variables. `require-span-on-public-service-method` accepts either data-first
`Effect.withSpan(program, "operation")` or `.pipe(Effect.withSpan("operation"))`.

The three test-shape rules are strict opt-in checks: use
`testingObservabilityAndQa` when a repository follows this test style; they are
not in `recommended`. For an expected typed failure, the preferred pattern from
[EffectPatterns service-test guidance](https://github.com/PaulJPhilp/EffectPatterns/blob/main/docs/SERVICE_PATTERNS.md)
is to apply [`Effect.flip`](https://effect-ts.github.io/effect/effect/Effect.ts.html#flip),
execute the flipped Effect, and assert the returned error's `_tag`, message,
and structured fields. `Effect.flip` moves the expected typed failure into the
success channel, making the assertion explicit. This rule deliberately matches
only a direct `expect(Effect.runPromise(...)).rejects` shape; ordinary
JavaScript rejection assertions, aliases, helpers, and other promise chains are
out of scope.

Configure path-sensitive rules independently when a repository uses different
application and configuration boundaries:

```ts
import { defineConfig } from "oxlint";
import { platformAndBoundaryHygiene } from "@opsydyn/oxlint-effect";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [...platformAndBoundaryHygiene.jsPlugins],
  rules: {
    ...platformAndBoundaryHygiene.rules,
    "linteffect/no-node-platform-in-shared-code": [
      "error",
      { boundaryPaths: ["apps/**", "server/**"] },
    ],
    "linteffect/no-process-env-direct-read": [
      "error",
      {
        boundaryPaths: ["apps/**", "server/**"],
        configPaths: ["packages/config/**"],
      },
    ],
    "linteffect/no-hidden-effect-execution": [
      "error",
      { boundaryPaths: ["apps/**", "server/**"] },
    ],
    "linteffect/no-new-date-in-domain-logic": [
      "error",
      { boundaryPaths: ["apps/**", "server/**"] },
    ],
    "linteffect/no-boundary-try-catch-without-effect-map": [
      "error",
      { boundaryPaths: ["apps/**", "server/**"] },
    ],
  },
});
```

### Concurrency Safety

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-unbounded-effect-all` | `Effect.all(items.map(...))` without an inline `concurrency` option. | Requires explicit scheduling policy; omission actually defaults to sequential execution. This option-presence heuristic does not validate bounds: even `"unbounded"` stays clean. Stored inputs and named options are not resolved. |
| `linteffect/no-fire-and-forget-fork` | V4: discarded direct/curried `forkChild` / `forkDetach` constructors, yielded handles and terminal pipe operators, including startup options. Legacy: bare `Effect.fork` statements only. | Bare construction is lazy, not a launched fiber. Retain and join/await/interrupt executed handles; children follow parent lifetime, detached fibers do not. `forkScoped` / `forkIn` are excluded; stored aliases and nonterminal pipes are not inferred. |
| `linteffect/no-fork-in-loop` | V4: `forkChild` / `forkDetach` in the own body of `for`, `for...of`, `for...in`, `while`, or `do...while`, including direct/curried/terminal-pipe startup forms. Legacy: broad nested `Effect.fork` traversal. | Retaining handles does not impose a collection budget; prefer bounded `Effect.all` / `Effect.forEach`. Scoped APIs remain excluded, which is not proof of bounded work. V4 skips nested function definitions. |
| `linteffect/no-race-without-cleanup` | V4: direct/curried/terminal-pipe `race`, `raceAll`, `raceFirst` and `raceAllFirst` without visible cleanup markers in arguments or local enclosing wrappers, including recognised generators and `acquireUseRelease` use callbacks. Legacy: `race` / `raceAll` arguments only. | Races already interrupt losers; owned resources still need finalizers/scopes. Markers do not prove every branch releases. Preserve first-success versus first-completion semantics; named task/cleanup aliases are not resolved. |
| `linteffect/no-unobserved-fiber` | V4: yielded `forkChild` / `forkDetach` handles without a same-binding `Fiber.join`, `await`, `interrupt`, reference pipe or direct return. Legacy: direct `Effect.fork` initializers matched by file-wide name. | V4 lexical references keep same-name/shadowed observations separate; lazy Effects and scoped APIs stay clean. Return transfers ownership, not a guarantee of later observation. Aliases/aggregate observers and arbitrary wrapped initializers are not inferred; reference presence does not prove execution. |
| `linteffect/no-unbounded-concurrent-retry` | Visible `Effect.retry` calls inside immediate mapped `Effect.all` / `Effect.forEach` arguments without an inline concurrency option. | Makes scheduling policy explicit; omission defaults to sequential work. Option presence does not validate concurrency or retry bounds, and even explicit `"unbounded"` stays clean. Bound both job concurrency and retry/backoff policy. |
| `linteffect/no-blocking-call-in-effect` | Identifier calls ending in `Sync`, or literal `fs` / `crypto` / `zlib` members ending in `Sync`, inside `Effect.sync` / `gen`; v4 also recognises self-bound `gen` and direct/named generator `fn`. | Sync suffixes are a heuristic, not import/performance analysis. Use genuinely asynchronous APIs via v4 `callback` (legacy `async`) / `tryPromise`, or a worker for blocking work. A Promise wrapper does not offload it. V4 skips nested function definitions; legacy traversal is broad. |
| `linteffect/no-promise-concurrency-in-effect` | Literal `Promise.all`, `allSettled`, `race`, or `any` inside `sync` / `gen` or recognised major-specific logic callbacks; v4 adds self-bound `gen` and direct/named generator `fn`. | Prefer bounded `Effect.all` / `forEach`, legacy `either` / v4 `result` for typed outcomes, `raceFirst` for first completion and `race` for first success. Underlying operations must observe cancellation signals. Defects/interruption and `AggregateError` require explicit semantics, not a mechanical swap. V4 skips nested definitions; aliases/computed calls are not inferred. |
| `linteffect/no-shared-mutable-state-across-fibers` | Outer `let` / `var` scalar writes or known collection mutations in inline direct `all` / `forEach` work; v4 also checks direct/curried/terminal-pipe child/detached forks, using lexical binding identity. Legacy checks `fork` with file-wide name sets. | Use atomic `Ref.update` or immutable result aggregation. Worker-local/shadow parameters stay clean in v4. Syntax is not execution/data-race proof: constructors are lazy and default collections sequential. Stored task bodies, const containers and property writes are not inferred; the separate global-state rule has its own scope. |
| `linteffect/no-timeout-with-noninterruptible-promise` | V4: direct/curried/terminal-pipe `timeout`, `timeoutOption` or `timeoutOrElse` around literal `promise` / `tryPromise` adapters without callback parameters. Legacy: direct `timeout`, always flags `promise`, flags `tryPromise` without parameters. | Timeout interrupts the wrapper; the operation must honour its forwarded AbortSignal. Parameter presence is not cancellation proof, and named inputs/nonterminal pipes are not resolved. Legacy's signal-aware `promise` warning is retained despite that API supporting cooperative cancellation. Timeout failure is v4 `TimeoutError`, legacy `TimeoutException`. |
| `linteffect/no-uninterruptible-concurrent-region` | V4: direct or terminal-pipe masking around inline collection, current child/detached/scoped/in forks, success/first-completion races or `Queue.take` / `PubSub.take`; traverses recognised gen/fn and logic callbacks, not ordinary nested definitions. Legacy: broad old fork/race/collection/Queue.take traversal. | Broad masking can defer cancellation until work finishes. Keep critical sections short and restore long-running work with `uninterruptibleMask`; restore reinstates ambient status, so use `interruptible` when overriding an already-masked caller is intended. Scoping alone does not restore interruption. Lazy syntax is not execution or child-mask proof; named bodies are not resolved. |
| `linteffect/no-unbounded-queue-or-pubsub` | Explicit `Queue.unbounded` / `PubSub.unbounded`; v4 also detects `Queue.make` with omitted/undefined options or inline missing/undefined/Infinity capacity, and `PubSub.makeAtomicUnbounded`. | Use bounded suspend/backpressure constructors with an owned capacity. Named/spread options and computed capacities are not evaluated; clean syntax is not capacity validation. Dropping/sliding changes delivery semantics. V4 PubSub subscriptions use `PubSub.take`, legacy subscriptions use `Queue.take`; scope subscriptions and shut down owned buffers. |
| `linteffect/no-global-mutable-concurrency-state` | V4: lexical module/global `let` / `var` writes or known mutable-container operations in inline collections and direct/curried/terminal-pipe child/detached forks. Legacy: file-wide names, including function-local declarations, and old fork syntax. | Own `Ref` state per execution/service or aggregate immutable results. V4 excludes local/shadow bindings; object-property writes and stored task bodies remain outside scope. Syntax is not execution/data-race proof; default collections are sequential. |
| `linteffect/no-yield-with-held-semaphore-permit` | V4: instance/namespace `Semaphore.withPermit` / `withPermits`, including curried/terminal pipes, around visible waits, Promise adapters or current concurrent work in recognised gen/fn bodies. Legacy: `Effect.Semaphore.withPermits` and direct/curried `TSemaphore` forms with broad traversal. | Strict-only coordination policy, not permit-leak detection. Narrow unrelated waits when semantics allow; async I/O may intentionally be permit-bound, and moving it outside changes concurrency limits. Named tasks, ordinary nested definitions in v4 and other acquisition APIs are not inferred. |
| `linteffect/no-yield-with-held-mutable-ref` | Four effectful modifier names: `modifyEffect`, `modifySomeEffect`, `updateEffect`, `updateAndGetEffect`. V4: literal `SynchronizedRef` / `SubscriptionRef` namespaces, direct/curried/terminal-pipe forms and visible waits/current concurrent work through recognised gen/fn callbacks. Legacy: namespace/instance forms with broad traversal. | Strict-only short critical-section policy. Move only independent work outside, retaining a synchronous state transition; splitting state-dependent I/O can lose atomicity. V4 skips ordinary unused helpers, named callback bodies and unrelated object methods. Other modifier names remain outside this rule. |
| `linteffect/no-unscoped-background-fiber` | V4: direct/curried/terminal-pipe `forkDetach`, including returned/joined handles and a scope inside the detached child. Empty/undefined/inline-options factories stay clean. Legacy: direct `forkDaemon` without a visible `supervised` marker in child work. | Strict-only scoped-lifetime policy: use `forkScoped` / `forkIn` or child ownership. Joining/returning observes or transfers a handle, not scoped teardown. Legacy supervision observes but does not itself interrupt; v4 removed `Effect.supervised`. Intentional detached ownership still warns; stored factory aliases/named options are not inferred. |
| `linteffect/no-manual-deferred-coordination` | V4: direct `Deferred.make` / `makeUnsafe` bindings and same-binding awaits, including captured closures. Recognises current timeout/race, interruptible/scoped and same-binding finalizer markers; supports direct/curried/terminal timeout/race forms. Legacy: function-local name matching with `make` / `unsafeMake` and old protection tables. | Strict-only completion/cancellation ownership policy. V4 distinguishes shadowed finalizer bindings and does not treat a timeout fallback callback as bounded source work. Scope, interruptibility or finalizer reference presence is not proof of execution or eventual completion; named latch aliases are not resolved. |
| `linteffect/no-acquire-without-scoped-release` | Resource-shaped acquisition names inside inline collection/fork/race work. V4 adds current child/detached/scoped/in forks, first-completion races, curried/terminal pipes and recognised gen/fn/logic/adapter/mapped callbacks; skips ordinary unused definitions. Legacy: old fork/race names and broad traversal. | Own actual release with `acquireRelease`, `acquireUseRelease` or registered finalizers. Existing scope and name-matched finalizer markers remain coarse exclusions, not cleanup proof: a bare scope does not release a raw resource. Naming is a heuristic; stored tasks, aliases and generic factory names are not resource-type inference. |

Scheduling/fork anti-patterns and repairs are typechecked in the
[Effect 4 corpus](examples/effect4-consumer/src/qualification/concurrencySafety/)
and [legacy Effect 3 corpus](examples/effect3-consumer/src/qualification/concurrencySafety/).
Their runtime contracts verify ordered values, original failure identity,
bounded scheduling/retries, parent/scoped interruption, explicit detached
cleanup and race-loser resource release. Q18 adds
[async/shared-state contracts](examples/effect4-consumer/src/qualification/concurrencySafety/async-state.contracts.ts)
for callback adapters, ordered outcomes, cooperative loser cancellation and a
deterministic lost-update counterexample repaired with `Ref.update`.
Q19's [cancellation/buffer contracts](examples/effect4-consumer/src/qualification/concurrencySafety/cancellation-buffers.contracts.ts)
advance TestClock rather than assert elapsed time, verify cooperative abort,
deferred interruption/exactly-once finalizers, and bounded FIFO/backpressure
with a live scoped PubSub subscriber. Unbounded PubSub's reported capacity is
`Number.MAX_SAFE_INTEGER`, not a memory-safety guarantee.
Q20's [ownership/coordination contracts](examples/effect4-consumer/src/qualification/concurrencySafety/ownership-coordination.contracts.ts)
prove a module-state lost update, per-execution `Ref.update` repair, Deferred
success/failure/interruption and timeout outcomes, and permit contention with
exactly-once release on success, failure and interruption. A scoped bare latch
is an explicit lint-clean limitation: external interruption still owns teardown.
Compiler-negative controls distinguish legacy `unsafeMake(FiberId)` and
`Effect.Semaphore.withPermits` from current `makeUnsafe()` and `Semaphore` APIs.
Legacy `TSemaphore` wraps Effect work, with work-first direct and semaphore-first
curried forms; it is not a current-v4 API.
Q21's [ref/lifetime/acquisition contracts](examples/effect4-consumer/src/qualification/concurrencySafety/ref-background-acquisition.contracts.ts)
verify lock contention, independent-delta repair, unchanged state on modifier
failure/interruption, detached work surviving caller completion, owned-child
teardown and resource finalization on all three exit paths. Resources are typed
stand-ins with counted release, not native filesystem/network qualification.
V4 `modifySomeEffect` returns `Effect<[result, Option<state>]>`; legacy takes a
fallback and `Option<Effect<[result, state]>>`. Both no-update branches preserve
state and result. Do not mechanically port the optional modifier's signature.
The allocated concurrency batches are qualified; cross-group composition and
the remaining resource-lifetime batches are still pending.
V4 fiber observation and shared-state checks use Oxlint's
lexical scope metadata, not TypeScript type inference; they do not require
`typeAware` or enable compiler diagnostics.
Qualification uses completion markers and a 60-second deadlock watchdog, not
timing-based behavioural assertions. Qualification remains scoped to the
documented calling forms and pinned package versions.

### Resource Lifetime

These rules use a central syntax-only resource vocabulary (`client`, `connection`,
`conn`, `pool`, `db`, `database`, `file`, `socket`, `stream`, `server`,
`subscription`, and `handle`). They require an Effect ecosystem import and
support the same `boundaryPaths` option as the other lifecycle rules.

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-manual-resource-close` | Resource-like `.close()`, `.destroy()`, `.dispose()`, or `.cleanup()` outside release/finalizer arguments. V4 includes effect-valued `Scope.addFinalizer`. | Encourages owned cleanup; callback presence is not execution proof. |
| `linteffect/no-unbound-scope` | `Scope.make()` without a same-function, same-binding `Scope.close`, or a matching acquire/release callback. Legacy policy also accepts `Effect.scoped`/`Layer.scoped` markers. | Exposes unowned manual scopes. V4 scoping alone does not close a separately created scope. |
| `linteffect/no-resource-succeed-escape` | `Effect.succeed(resourceLike)` for client, connection, pool, file, socket, stream, server, subscription, or handle-shaped values. | Keeps live resource lifetimes inside scoped Effect ownership; this heuristic is focused-only rather than recommended. |
| `linteffect/no-resource-without-acquire-release` | Runtime: resource-like `open` / `connect` / `create` / `start` / `listen` / `subscribe` / `acquire` calls without a release owner. | Makes resource ownership explicit across failure, interruption, and shutdown. |
| `linteffect/no-request-scoped-long-lived-resource` | Strict: resource acquisition/construction in named handlers; v4 follows inline gen/fn, mapping and sync/suspend/Promise callbacks. | Keeps long-lived pools in application Layers; intentionally request-owned resources can still warn. |
| `linteffect/no-global-resource-singleton` | Strict: resource-shaped module constructors, including blocks/static fields. | Keeps shutdown owned by Layers; v4 advice uses Context.Service, legacy advice retains Effect.Service. |
| `linteffect/no-run-with-open-resource` | Runtime: `Effect.run*` alongside an unowned resource creation in the same lexical function. | Flags possible unmanaged lifetime; does not prove execution order or whether a handle remains open. |
| `linteffect/no-nested-acquire-release` | Strict: three acquisition calls within one acquisition tree, including siblings. | Encourages named owners and manageable release boundaries; not a leak detector. |
| `linteffect/no-missing-layer-provision-at-run` | Strict: a visible Service-shaped yield without a visible `Effect.provide` or `Layer.provide`. | Encourages visible Layer ownership; not compiler-proven dependency completeness. |

Q22's cleanup, scope and success-value examples use pinned Effect 3.21.4/4.0.0
consumers. Behavioural qualification is recorded in the
[campaign report](docs/superpowers/reports/2026-10-01-effect4-complete-qualification.md#q22-cleanup-manual-scopes-and-resource-success-values);
final batch closure is blocked by the unchanged 30 KB size gate.

Prefer the supplied `Effect.scope` inside `Effect.scoped`, or acquire a manual
`Scope.make()` with `Effect.acquireUseRelease` and release it using
`Scope.close(scope, exit)`. Both majors register effect-valued finalizers with
`Scope.addFinalizer(scope, effect)`, and exit-aware callbacks with
`Scope.addFinalizerExit(scope, exit => effect)`. Current interruptible acquisition
uses `Effect.acquireRelease(acquire, release, { interruptible: true })`; legacy
`acquireReleaseInterruptible` instead passes only the exit to its release callback.
V4 acquire/release APIs in these examples are data-first only.

These checks are not resource escape analysis. Named callbacks, aliases and
computed properties remain opaque. The legacy detector retains warnings on valid
curried release callbacks and effect-valued `Scope.addFinalizer` cleanup. A visible
`Scope.close` can be lazy or unreachable; legacy scoped markers can leave a manual
scope open. `no-resource-succeed-escape` remains focused-only and can warn inside
owned use or on immutable `client.value`, while a generic alias can escape without
warning. Do not mechanically rename values to silence it. The repairs export data
after owned use; runtime controls demonstrate once-only release on success,
failure and interruption, repeated scope close, premature double cleanup and an
already-closed returned handle. Typed stand-ins do not qualify native I/O behaviour.

Q23 adds [paired acquisition/request/singleton examples](examples/effect4-consumer/src/qualification/resourceLifetime)
and application-layer lifetime contracts. V4 rejects removed
`Layer.scoped`/`acquireReleaseInterruptible` ownership markers. Request/global
rules accept `effectVersion` alongside `boundaryPaths`; select
`effect3.resourceLifetime` for legacy traversal and repair advice. Current request
analysis follows recognised inline callbacks but skips unused ordinary functions;
factory/constructor aliases and computed properties remain opaque. Raw acquisition
inside `Effect.scoped` retains a coarse clean marker but still needs real release.
One application Layer shares a pool across requests and finalizes it once;
separately providing that Layer per request is not that lifetime repair.

Q24 adds paired nesting/provision/runner examples in the same directory. Named
acquisition composition preserves reverse-order, once-only cleanup on success,
failure and interruption. Nesting counts descendant acquisitions, not depth alone.
V4 provision checks follow native binding identity and recognised inline workflows;
legacy first-name resolution and unused-function traversal are retained. A valid
`run*With` context can still warn under this strict visible-Layer policy, while an
unexecuted provide marker can suppress it. Service-like names are not type proof.
Open-resource checks have no `boundaryPaths` option and retain lexical
co-occurrence warnings even when acquisition happens after execution or is closed
manually. Opaque factories remain outside local analysis. Consult the examples
before applying a repair; renaming or adding a lazy marker does not own a resource.

`Scope.global` remains a deferred candidate because the supported Effect API does
not currently expose it; it is not part of the v1 export surface.

### Pipeline Shape and Sequencing

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-nested-effect-call` | Deeply nested `Effect.xx(Effect.yy(...))` calls. | Flattens sequencing into readable pipelines. |
| `linteffect/no-effect-ladder` | Nested Effect combinator ladders in assignments or returns. | Avoids control flow hidden inside expression towers. |
| `linteffect/no-flatmap-ladder` | Nested `Effect.flatMap` and `map` plus `flatten` ladders. | Encourages one clear bind point after context is built. |
| `linteffect/no-pipe-ladder` | Nested `pipe(...)` or method `.pipe(...)` chains. | Keeps pipelines flat and scan-friendly. |
| `linteffect/no-call-tower` | Effect calls passed directly into other Effect calls. | Makes intermediate effects named or piped. |
| `linteffect/no-effect-orElse-ladder` | `Effect.orElse` wrapped around sequencing chains. | Keeps error handling at an explicit decision point. |
| `linteffect/no-effect-wrapper-alias` | Const/function aliases that only wrap Effect calls. | Discourages wrapper choreography with no domain meaning. |
| `linteffect/warn-effect-sync-wrapper` | `Effect.sync(() => someCall())` around non-console calls. | Avoids hiding side effects behind vague sync wrappers. |
| `linteffect/no-effect-side-effect-wrapper` | `Effect.as` or `Effect.zipRight` around side-effecting operands. | Prevents side effects from being disguised as discarded values. |
| `linteffect/no-effect-all-step-sequencing` | Sequential side effects hidden in `Effect.all(..., { concurrency: 1 })`. | Reserves `Effect.all` for aggregation, not imperative step lists. |
| `linteffect/no-effect-succeed-variable` | `Effect.succeed(variable)` used as a branch placeholder. | Encourages selecting plain values before entering Effect flow. |

### Branching and Local Control Flow

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-if-statement` | Imperative `if` statements in Effect files. | Pushes branching toward typed Match/Option/Either decisions. |
| `linteffect/no-switch-statement` | Imperative `switch` statements in Effect files. | Encourages exhaustive domain matching. |
| `linteffect/no-ternary` | Ternary expressions in Effect files. | Keeps decisions explicit and named. |
| `linteffect/no-try-catch` | `try/catch`. | Keeps failures in typed Effect error channels. |
| `linteffect/no-arrow-ladder` | Nested arrow IIFEs. | Avoids local wrapper control flow. |
| `linteffect/no-iife-wrapper` | Immediately invoked function wrappers. | Moves decisions into named values or pipelines. |
| `linteffect/no-return-in-arrow` | `return` inside block-bodied arrow callbacks. | Prefers expression callbacks for simple pipeline steps. |
| `linteffect/no-return-in-callback` | `return` inside inline function callbacks. | Reduces hidden local control flow. |
| `linteffect/no-return-null` | `return null` in Effect files. | Uses `Option.none` or typed failures instead of null sentinels. |
| `linteffect/no-branch-in-object` | Match/Option/Either decisions inside object literals. | Computes decisions first, then builds data from named values. |

### Option, Match, and Data Normalization

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-option-as` | `Option.as(...)`. | Makes selection explicit with `Option.map` or `Option.match`. |
| `linteffect/no-match-void-branch` | Match branches returning `Effect.void`. | Avoids no-op branches that hide guard-style control flow. |
| `linteffect/no-match-effect-branch` | Multi-step sequencing inside Match or Option branches. | Selects data in Match/Option, then runs one Effect pipeline. |
| `linteffect/no-model-overlay-cast` | `as` assertions on decoded model flow. | Avoids hiding schema drift with unchecked overlays. |
| `linteffect/no-unknown-boolean-coercion-helper` | Local unknown-to-boolean checks paired with null fallback matching. | Moves boolean normalization to the schema boundary. |
| `linteffect/no-fromnullable-nullish-coalesce` | `Option.fromNullable(value ?? null)` or `?? undefined`. | Passes nullable sources directly without rewrapping noise. |
| `linteffect/no-option-boolean-normalization` | Repeated `Option.match` boolean normalization. | Normalizes once at the boundary and reads typed booleans later. |
| `linteffect/no-string-sentinel-return` | `Effect.succeed("token")` sentinel returns. | Uses domain values, Option/Either, or tagged unions for decisions. |
| `linteffect/no-string-sentinel-const` | String constants used as state/status tokens. | Avoids ad hoc string state machines. |

### Atom, State, and Platform Boundaries

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-effect-sync-console` | `console.*` inside `Effect.sync`. | Uses `Effect.log*` or a real logging boundary. |
| `linteffect/no-atom-registry-effect-sync` | Atom or atom registry operations wrapped in `Effect.sync`. | Keeps atom operations in the atom flow. |
| `linteffect/no-family-collection-read` | `Atom.family` projections that read broad collection atoms. | Keeps keyed atoms keyed instead of coupling to whole collections. |
| `linteffect/no-naked-object-state-update` | Raw object spreading, `Object.assign`, JSON rebuilds, and similar state shortcuts. | Preserves explicit model transitions and schema boundaries. |
| `linteffect/no-wrapgraphql-catchall` | `Effect.catchAll` after `wrapGraphqlCall` or `applyResponse`. | Handles GraphQL envelope errors at the response mapping boundary. |

### Domain Modeling

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-raw-domain-id-alias` | `type UserId = string` and similar raw ID aliases. | Branded IDs prevent swapped identifiers across boundaries. |
| `linteffect/no-boolean-domain-flag` | Boolean behavior flags such as `shouldNotifyCustomer`. | Replaces hidden modes with commands, tagged unions, or explicit functions. |
| `linteffect/no-magic-domain-string` | Raw string comparisons such as `status === "approved"`. | Makes domain vocabularies typed and exhaustive. |
| `linteffect/no-raw-domain-primitive-params` | Domain-looking functions with several raw string/number params. | Introduces branded values or command objects for meaningful inputs. |
| `linteffect/no-raw-time-domain-field` | Time-looking fields typed as `number` or `Date`. | Models durations and clock boundaries explicitly. |
| `linteffect/no-overloaded-options-object` | `opts`, `options`, or `config` typed as `any` or `object`. | Uses Schema decoding or named config models instead of loose bags. |
| `linteffect/no-domain-logic-in-conditional` | Multi-clause business rules embedded in boolean expressions. | Extracts named predicates or validation Effects that can be tested. |
| `linteffect/no-implicit-state-machine-object` | Multiple boolean lifecycle flags on one object. | Models impossible states away with tagged unions. |
| `linteffect/no-adhoc-domain-error` | `Effect.fail("...")` and `throw new Error("...")` in domain code. | Uses structured tagged errors for recovery and observability. |
| `linteffect/no-domain-meaning-by-folder-only` | Admin/public/internal meaning encoded only in names around raw IDs. | Represents context in types, commands, policies, or services. |

### Error Modeling

Public Effect operations should expose one structured, recoverable error
channel. The `ddd` preset includes the complete Domain Modeling and Error
Modeling groups; DDD-only rules remain opt-in to keep `recommended` compatible
with existing projects.

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-error-as-public-effect-error` | Exported functions returning `Effect.Effect<_, Error, _>`. | Generic `Error` hides recovery semantics and domain context. |
| `linteffect/no-unknown-public-error-channel` | Exported functions returning `Effect.Effect<_, unknown, _>`. | Callers cannot recover by tag or type from an `unknown` channel. |
| `linteffect/no-mixed-effect-error-shapes` | Public error unions mixing `Error`, `unknown`, string, number, or boolean shapes. | A single tagged error union keeps recovery and observability predictable. |
| `linteffect/no-effect-fail-error-message` | `Effect.fail(error.message)`, string concatenation, or templates that stringify an error. | Preserves the original error tag, cause, and context instead of collapsing it into a string. |
| `linteffect/no-catchall-generic-rethrow` | Plain `catch`/`catchEager` (v4) or `catchAll` (v3) handlers returning `Effect.fail(new Error(...))`. | Preserve the original error or explicitly map to a structured tagged error with its cause. |
| `linteffect/no-log-only-error-handling` | V4 catch/eager/Cause/defect/filter/tag/reason handlers and maps that log without modelling or retaining failure. Legacy v3 also reports `tapError`. | Re-fail typed errors, retain causes with `failCause`, or retain defects with `die`. V4 observers (`tapError`, `tapCause`, `tapDefect`) stay clean because they preserve failure. |
| `linteffect/no-early-catchall-null` | Non-boundary `catch`/`catchEager` (v4) or `catchAll` (v3) recovery with `Effect.succeed(null)`, `undefined`, or an identifier containing fallback/default. | Propagate typed failures or recover at a configured boundary instead of leaking untyped absence. |
| `linteffect/no-expected-state-as-error` | `Effect.fail("NotFound")`, `"Missing"`, `"Empty"`, or `"None"`. | Models expected states as `Option`, `Result` (v4), `Either` (v3), or tagged data instead of overloading failure. |
| `linteffect/no-exception-domain-error` | `throw new *Error` inside Effect generators and supported combinator callbacks. | Uses `Effect.fail` with a payload-bearing `Data.TaggedError`. V4 covers catch/eager/Cause/defect/filter/tag/reason handlers and handler maps; unrelated nested functions stay clean. |
| `linteffect/no-empty-error-tag` | Strict: `_tag`-only error types and `Data.TaggedError` classes with empty payloads. | Requires enough structured context for recovery, diagnosis, and domain-level observability. |
