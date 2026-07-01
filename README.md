# linteffect Oxlint plugin

Oxlint plugin rules for Effect TypeScript code-shape constraints.

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

## Rule Groups

The recommended config enables every rule as an error. The rules are heuristic:
they flag code shapes that tend to hide Effect flow, domain meaning, or runtime
boundaries.

### React and Runtime Boundaries

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-react-state` | React state hooks such as `useState`, `useReducer`, and `useEffect`. | Keeps React UI state in the atom/runtime model instead of bypassing it. |
| `linteffect/no-runtime-runfork` | `Runtime.runFork(...)`. | Detached fibers hide ownership, interruption, and lifecycle boundaries. |
| `linteffect/no-run-effect-outside-boundary` | Direct `Effect.runPromise`, `Effect.runSync`, `Effect.runFork`, and related `Effect.run*` calls. | Keeps Effect execution owned by app, CLI, worker, route, or test boundaries. |
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
| `linteffect/no-effect-fn-generator` | `Effect.fn(function* ...)`. | Avoids wrapper generators that obscure sequencing. |
| `linteffect/no-nested-effect-gen` | `Effect.gen` nested inside another `Effect.gen`. | Keeps generator-based effects linear. |
| `linteffect/no-yield-without-star-in-effect-gen` | Plain `yield` inside `Effect.gen`. | Requires `yield*` so generator steps delegate to the Effect interpreter. |
| `linteffect/no-async-effect-combinator-callback` | `async` callbacks passed to common Effect combinators. | Prevents Promise-returning callbacks from bypassing Effect error, interruption, and tracing semantics. |
| `linteffect/no-throw-in-effect-logic` | `throw` inside `Effect.gen` or common Effect combinator callbacks. | Keeps failures in typed Effect error channels. |
| `linteffect/no-try-catch-in-effect-logic` | `try/catch` inside `Effect.gen` or common Effect combinator callbacks. | Uses Effect error combinators instead of local imperative recovery. |
| `linteffect/no-promise-api-in-effect-logic` | `Promise.all`, `Promise.race`, `.then`, `.catch`, and related Promise APIs inside Effect logic. | Keeps scheduling, cancellation, tracing, and failures inside Effect. |
| `linteffect/no-swallowed-catch-all` | `Effect.catchAll` handlers that recover with `Effect.succeed`, `Effect.void`, `Effect.asVoid`, or `Effect.ignore`. | Avoids hiding failures without telemetry, re-fail, or explicit typed recovery. |
| `linteffect/no-manual-effect-channels` | Manual `Effect.Effect<...>` and `Layer.Layer<...>` channel types. | Lets Effect infer channels from real composition. |
| `linteffect/no-effect-type-alias` | Type aliases around `Effect.Effect<...>`. | Keeps service surfaces concrete and discoverable. |
| `linteffect/no-public-generic-effect-error` | Exported APIs returning `Effect.Effect<_, Error, _>`. | Public Effect APIs should expose tagged, recoverable domain errors instead of generic `Error`. |

### Concurrency Safety

| Rule | Catches | Why |
| --- | --- | --- |
| `linteffect/no-unbounded-effect-all` | `Effect.all(items.map(...))` without an explicit `concurrency` option. | Prevents load-dependent runaway parallelism and makes throughput ownership explicit. |
| `linteffect/no-fire-and-forget-fork` | Bare `Effect.fork(...)` expression statements. | Detached fibers hide failure, interruption, and lifecycle ownership. |
| `linteffect/no-fork-in-loop` | `Effect.fork(...)` inside `for`, `for...of`, `for...in`, `while`, or `do...while` loops. | Avoids loop-spawned unbounded fibers; use bounded `Effect.all` / `Effect.forEach` or scoped supervision. |
| `linteffect/no-race-without-cleanup` | `Effect.race(...)` / `Effect.raceAll(...)` without `Effect.ensuring`, scoped, or acquire/release cleanup. | Racing effects need explicit loser cleanup so losing work and resources do not leak. |
| `linteffect/no-unobserved-fiber` | `const fiber = Effect.fork(...)` when the fiber is never passed to `Fiber.join`, `Fiber.await`, or `Fiber.interrupt`. | Forked fibers should have observed failure and interruption ownership. |
| `linteffect/no-unbounded-concurrent-retry` | `Effect.retry(...)` nested inside unbounded mapped `Effect.all(...)` or unbounded `Effect.forEach(...)`. | Prevents retry storms by requiring bounded concurrency or a queue/backoff policy. |
| `linteffect/no-blocking-call-in-effect` | Sync `fs` / `crypto` / `zlib` calls inside `Effect.sync` or `Effect.gen`. | Blocking calls stall the runtime worker and should live behind async/platform boundaries. |
| `linteffect/no-promise-concurrency-in-effect` | `Promise.all`, `Promise.allSettled`, `Promise.race`, or `Promise.any` inside Effect logic. | Keeps concurrency, interruption, tracing, and typed failures inside Effect. |
| `linteffect/no-shared-mutable-state-across-fibers` | Outer `let` / `var` state mutated from `Effect.fork`, `Effect.all`, or `Effect.forEach` work. | Shared mutable state across fibers creates nondeterministic races; use Effect concurrency primitives. |
| `linteffect/no-timeout-with-noninterruptible-promise` | `Effect.timeout(Effect.promise(...))` or `Effect.timeout(Effect.tryPromise(...))` without a signal-aware callback. | Timeout should interrupt the underlying async operation, not only the Effect wrapper. |

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
