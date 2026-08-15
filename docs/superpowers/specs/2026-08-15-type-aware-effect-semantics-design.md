# Opt-In Type-Aware Effect Semantics Design

**Status:** Approved design; implementation not started

**Date:** 2026-08-15

## Goal

Add an opt-in type-aware configuration surface for `@opsydyn/oxlint-effect`
without changing the existing package behaviour, while preparing a gated
roadmap for semantic Effect rules once Oxlint supports custom type-aware
JavaScript plugin rules.

## Context

The package currently provides an Oxlint JavaScript plugin built around
ESLint-compatible AST visitors. Its rules are intentionally syntax-only and
require an Effect ecosystem import. They do not resolve aliases, infer Effect
return types, or follow values across variables and modules.

Oxc's stable type-aware mode is provided by `oxlint-tsgolint`. It can be
enabled through the root Oxlint option `options.typeAware: true`, while
`options.typeCheck` additionally enables TypeScript compiler diagnostics. The
two concerns are separate for this package. See the [Oxc type-aware linting
guide](https://oxc.rs/docs/guide/usage/linter/type-aware.html).

The current Oxc JavaScript plugin API does not expose TypeScript type
information to custom rules. The [JS plugin API documentation](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)
explicitly lists custom type-aware rules as unsupported. This design therefore
ships a configuration bridge now and gates custom semantic Effect rules on an
official Oxc typed-plugin API.

## Design Decisions

### Preserve the existing default

`recommended` remains unchanged. Existing group presets remain syntax-only and
retain their current rule membership, severity, and readonly plugin tuple
contract.

The new surface is additive and opt-in. It does not alter existing consumers
who import `recommended`, a named group preset, `allRules`, or the default
plugin object.

### Add a `typeAware` preset

The package will export a config-shaped `typeAware` preset with this public
shape:

```ts
{
  options: { typeAware: true },
  jsPlugins: recommended.jsPlugins,
  rules: recommended.rules,
}
```

The preset will:

- enable Oxc's type-aware engine;
- preserve the existing recommended `linteffect/*` rules;
- avoid enabling any `typescript/*` rules on behalf of the consumer;
- omit `options.typeCheck` entirely;
- retain the readonly `jsPlugins` tuple so consumers can spread it where
  Oxlint's mutable config type requires an array.

The preset will not claim that the package's custom rules receive type
information. It is a configuration bridge for Oxc's engine and the existing
syntax plugin.

Example consumer configuration:

```ts
import { defineConfig } from "oxlint";
import { typeAware } from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  rules: typeAware.rules,
});
```

Consumers may add Oxc's built-in `typescript/*` rules independently. Rule
selection remains a consumer concern rather than becoming an implicit part of
the Effect plugin's contract.

### Keep `oxlint-tsgolint` consumer-owned

`@opsydyn/oxlint-effect` will not add `oxlint-tsgolint` as a dependency or
peer dependency. A consumer that opts into the preset must install and
version-align:

- `oxlint`;
- `oxlint-tsgolint`;
- the TypeScript version and project configuration required by the selected
  Oxc release.

This avoids bundling a platform-specific type-aware engine into a syntax-only
plugin and lets each repository control the Oxlint/tsgolint compatibility
pair. The consumer documentation will state the current TypeScript 7
compatibility requirement and the need for resolved declarations in
monorepos.

### Do not duplicate TypeScript program analysis

The package will not create a second TypeScript program through the compiler
API, `ts-morph`, or an equivalent sidecar. That would duplicate the work
already performed by `tsgolint`, create version skew, complicate editor
behaviour, and make type-aware diagnostics dependent on an unsupported private
integration.

Custom semantic Effect rules remain deferred until Oxlint provides an official
typed-plugin API with a supported way to access the resolved program and
symbols.

## Initial Implementation Scope

The first implementation slice contains configuration, consumer QA, and
documentation only.

### Package API

Modify the existing public export surface to add:

- `typeAware` config preset;
- `presets.typeAware` entry;
- generated API documentation for the new export.

Do not change:

- `recommended` rule membership;
- existing named group presets;
- rule implementations;
- `allRules` or the default plugin registration;
- package runtime dependencies.

### Typed consumer fixture

Create an isolated `examples/type-aware-consumer/` fixture. It will contain:

- a private `package.json` with Effect, Oxlint, the published/local plugin
  package, `oxlint-tsgolint`, and the required TypeScript toolchain;
- a root `oxlint.config.ts` that spreads the `typeAware` preset and enables
  the built-in `typescript`, `unicorn`, and `oxc` plugins;
- a scoped `tsconfig.json` that excludes build outputs and unrelated files;
- Effect anti-patterns proving the existing `linteffect/*` diagnostics still
  run in type-aware mode;
- explicit fixture rules for `typescript/no-floating-promises` and
  `typescript/no-misused-promises`, with TypeScript examples carrying
  `// EXPECT:` annotations for both rule IDs;
- a README explaining installation, root-only configuration, and the
  intentional absence of `typeCheck`.

The fixture will keep the problematic source intact. It is an observation and
regression corpus, not a cleaned sample application.

The fixture is a QA corpus, not an application that must lint cleanly. Its
verification compares expected and observed diagnostic IDs and exits
successfully only when the expected warnings are present and no unexpected
IDs appear.

### Root tests and scripts

Add focused configuration and integration coverage without changing the
existing test discovery contract:

- assert the exact `typeAware` export shape in `tests/config.test.ts`;
- verify that `recommended` remains unchanged;
- add a type-aware Oxlint integration test using an isolated configuration;
- add a dedicated type-aware verification script that handles the intentional
  warning corpus through the existing expected-versus-observed mechanism;
- keep `bun run test` focused on `tests/*.test.ts` rather than recursively
  discovering the consumer fixture's dependencies.

The standard package gates remain unchanged:

```text
bun run test
bun run typecheck
bun run build
bun run lint
bun run docs:api:check
bun run size
bun run pack:dry-run
```

The type-aware consumer check is an additional opt-in integration gate. It
must not make the ordinary syntax-only package gate depend on a consumer's
tsgolint installation.

### CI

Keep the existing fast syntax-only quality path. Add a separate type-aware
job that:

1. installs the consumer fixture dependencies;
2. builds any local package artifact required by the fixture;
3. runs the type-aware expected-diagnostic check;
4. records the Oxlint and tsgolint versions used;
5. does not enable `typeCheck`.

A failure to resolve the typed engine, project configuration, or declarations
must fail this dedicated job rather than being silently treated as a skipped
typed check.

## Documentation and Failure-Example Contract

Documentation must cover every public configuration variant, not only the
happy-path `typeAware` import. The examples and README will show runnable
configurations for:

1. `recommended` as the unchanged syntax-only baseline;
2. `typeAware` as a direct config spread;
3. `typeAware` composed with the existing named group presets and rule-only
   exports;
4. CLI `--type-aware` used without the package preset;
5. `typeAware` with consumer-selected `typescript/*` rules;
6. the deliberate separation between `typeAware` and `typeCheck`;
7. a published package install and a local packed-artifact install;
8. editor/LSP configuration where the current Oxc integration supports the
   root `typeAware` option.

The failure corpus will include unfixed, annotated examples for these
observable outcomes:

- Effect syntax anti-patterns still report `linteffect/*` rules in type-aware
  mode;
- selected built-in typed rules report Promise/callback misuse;
- the typed engine cannot start when `oxlint-tsgolint` is absent;
- type-aware analysis cannot resolve a malformed or incompatible project
  configuration;
- a monorepo fixture fails closed when dependent declarations are unavailable;
- a nested config cannot be used to activate the root-only `typeAware` option;
- `typeAware` alone does not emit TypeScript compiler diagnostics;
- explicit `typeCheck` activation reports compiler diagnostics separately;
- valid Effect and TypeScript controls do not produce expected failure IDs.

Each lint failure example must include:

- the exact expected rule ID in a `// EXPECT:` annotation where a rule
  diagnostic is expected;
- a short comment linking the example to the relevant README rule entry;
- a valid control example beside the invalid example;
- the command used to observe the result and the expected exit/report shape;
- no autofix or inline suppression that hides the anti-pattern.

Configuration and dependency failures do not have lint rule IDs, so their
examples will document the expected setup failure class and the corrective
installation/configuration boundary without relying on an unstable diagnostic
wording.

Every future semantic rule slice inherits the same matrix: explicit and
inferred types, aliases, re-exports, cross-file use where claimed, valid
boundary cases, and a syntax-only comparison. A rule is not release-ready
until both its failure examples and its non-failure controls are present.

## Semantic Effect Rule Roadmap

The following work is not part of the initial configuration slice. It is the
ordered roadmap for the first custom type-aware rules after the Oxc API gate
is satisfied.

### API Gate

Before semantic rule implementation begins, Oxc must provide all of the
following through a supported API:

- access to resolved TypeScript types or symbols from a custom rule;
- correct handling of aliases, imports, re-exports, and inferred return
  types;
- project-aware resolution using the same `tsconfig`/program as type-aware
  linting;
- stable diagnostic locations and rule registration;
- no requirement for the plugin to construct a second TypeScript program.

Until these conditions are met, the package remains syntax-only and the
semantic roadmap remains documentation and upstream-tracking work.

### Slice A: Public Effect Contracts

Use resolved types to improve the existing public contract rules across
aliases and inferred return types:

- `no-public-generic-effect-error`;
- `no-unknown-public-error-channel`;
- `no-service-method-returning-promise`.

The typed path must not duplicate a syntax diagnostic for the same source
span. Existing syntax-only behaviour remains available when `typeAware` is
not enabled.

### Slice B: Service and Environment Contracts

Use Effect's service and environment channels to improve dependency checks:

- `no-missing-layer-provision-at-run`;
- `require-service-dependencies`;
- `no-run-effect-outside-boundary`.

The implementation must distinguish a genuinely unresolved service
requirement from an `any`/unknown boundary and must document how intentionally
dynamic runtime composition is configured or suppressed.

### Slice C: Resource Ownership Research

Evaluate, but do not automatically promote, typed versions of:

- `no-resource-succeed-escape`;
- `no-run-with-open-resource`;
- `no-acquire-without-scoped-release`.

TypeScript types do not encode runtime lifetimes by themselves. A rule may
ship only if the Effect API model provides sufficient evidence for scope
ownership, acquisition, and release. Identifier-name heuristics must remain
the fallback syntax rules and must not be presented as type proofs.

## Diagnostics and Compatibility Contract

Every future semantic rule must satisfy these conditions before release:

- valid alias and re-export fixtures;
- inferred and explicit type fixtures;
- cross-file fixture coverage where the rule claims project awareness;
- valid dynamic or boundary cases;
- one diagnostic per anti-pattern, with stable rule ID and source span;
- syntax-only behaviour verified separately;
- no change to `recommended` unless a separate approved release decision
  explicitly changes the default.

The package will not advertise semantic guarantees that depend on unavailable
Oxc APIs. Documentation will distinguish clearly between:

1. syntax-only `linteffect/*` rules;
2. Oxc's built-in `typescript/*` type-aware rules;
3. future custom semantic Effect rules.

## Documentation and Roadmap Updates

The implementation slice will update:

- `README.md` with installation and configuration for `typeAware`;
- `README.md` with every public preset/configuration variant and its
  limitations;
- `examples/README.md` with the typed consumer QA workflow and failure-mode
  index;
- `examples/type-aware-consumer/README.md` with runnable setup, lint failure,
  and dependency/configuration failure examples;
- `roadmap/13-type-aware-effect-semantics/README.md` with the opt-in
  checklist, API gate, and semantic slices;
- generated API documentation through the existing TypeDoc gate;
- a Changeset describing the additive preset export.

The roadmap will explicitly record that the first release enables Oxc's
type-aware engine but does not make custom `linteffect/*` rules type-aware.

## Release Strategy

The initial configuration bridge is a minor, additive release because:

- `recommended` is unchanged;
- existing rule IDs and severities are unchanged;
- the new preset is opt-in;
- `oxlint-tsgolint` is not added to the package dependency graph.

Future semantic rules are also opt-in until their false-positive profile is
proven. A major release is only required if a later decision changes the
existing default preset or removes/renames a public rule or export.

## Success Criteria

The initial slice is complete when:

- `typeAware` is exported and type-checks for consumer configuration;
- `recommended` and every existing group preset retain their current public
  contract;
- the consumer fixture proves the typed engine and existing Effect rules run
  together;
- no compiler diagnostics are enabled by the package preset;
- no `oxlint-tsgolint` dependency is bundled by the package;
- the dedicated typed QA job fails closed on missing or malformed typed
  analysis;
- documentation and roadmap entries explain the boundary accurately;
- every public configuration variant has a runnable documentation example;
- the fixture contains unfixed examples for every supported lint and setup
  failure class, plus valid controls;
- all standard package gates and the dedicated typed QA gate pass.
