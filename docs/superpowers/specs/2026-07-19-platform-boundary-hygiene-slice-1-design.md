# Platform And Boundary Hygiene Slice 1 Design

## Goal

Add the first three Platform and Boundary Hygiene rules as conservative,
AST-only checks for Effect TypeScript modules:

- `no-node-fs-in-effect-code`
- `no-json-parse-without-schema`
- `no-date-now-in-effect`

## Rule Contracts

### `no-node-fs-in-effect-code`

Report imports from `fs`, `node:fs`, and `node:fs/promises` when the same module
imports the Effect ecosystem (`effect`, `effect/*`, or `@effect-atom/atom-react`).
Collect imports through the full module and report at `Program:exit` so source
order does not change the result.

Do not inspect `require`, dynamic imports, or filename/path context in this
slice. The rule is an Effect-module portability check, not a general Node ban.

### `no-json-parse-without-schema`

Report `JSON.parse(...)` in an Effect module unless the module imports an Effect
Schema entry point. An import from `effect/Schema` or a `Schema` binding from the
`effect` package is sufficient evidence for this conservative first version.

Do not attempt data-flow analysis between a parse result and a schema decode.
The presence of the Schema import is the explicit opt-out.

### `no-date-now-in-effect`

Report each `Date.now()` call that occurs within the callback/body of an
Effect-construction boundary. This slice covers `Effect.gen`, `Effect.sync`,
`Effect.try`, `Effect.tryPromise`, and `Effect.fn` calls in Effect modules.

Report each call site once, even if nested Effect boundaries would otherwise
encounter it more than once. The diagnostic should point users to Effect
`Clock` or `DateTime` rather than wall-clock reads embedded in Effect logic.

## Public API

Export a new config-shaped group and its rules-only companion:

- `platformAndBoundaryHygieneRules`
- `platformAndBoundaryHygiene`

Register the group in `ruleGroups` and `presets`; include its three rules in
`recommended` through the existing all-rules composition.

## Verification

Each rule must have:

- direct plugin tests for reported and allowed AST shapes;
- config export coverage for the group and preset;
- Oxlint CLI fixture coverage;
- annotated backend anti-pattern examples using `EXPECT` and `QA` comments;
- README and roadmap entries.

The slice is complete only after the repository's test, typecheck, build, lint,
API docs, size, package dry-run, and diff checks pass.
