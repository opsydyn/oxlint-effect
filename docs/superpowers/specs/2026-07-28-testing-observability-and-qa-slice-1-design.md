# Testing, Observability And QA Slice 1 Design

## Goal

Add the first Testing, Observability and QA rule batch without broad module-level
heuristics or type/data-flow inference:

- `linteffect/no-console-in-effect-flow`
- `linteffect/no-effect-log-without-structured-context`
- `linteffect/require-span-on-public-service-method`

All three rules remain public, are included in `recommended`, and are exposed
through a new `testingObservabilityAndQa` group and rule-only export.

## Detection Contracts

### `no-console-in-effect-flow`

- Gate on an Effect ecosystem import.
- Report `console.*` calls only inside callbacks supplied to `Effect.gen`,
  `Effect.sync`, `Effect.try`, `Effect.tryPromise`, or `Effect.fn`.
- Report `console.*` calls inside the `effect` or `scoped` implementation of an
  `Effect.Service` class.
- Do not report top-level console calls, CLI/boundary logging, aliases, or code
  that merely imports a package named `console`.

### `no-effect-log-without-structured-context`

- Gate on an Effect ecosystem import.
- Inspect `Effect.logError` and `Effect.logWarning` only within a direct
  `Effect.catchAll`, `Effect.catchTag`, `Effect.catchTags`, or `Effect.tapError`
  handler, or within an Effect.Service implementation.
- Report a log call with exactly one static string or template-literal message.
- Allow logs that include an additional object or error value. Allow a handler
  or service implementation subtree containing `Effect.annotateLogs(...)`.
- Do not infer aliases, application-specific logger wrappers, annotations in
  enclosing scopes, or whether a template interpolation contains useful context.

### `require-span-on-public-service-method`

- Gate on an Effect ecosystem import.
- Inspect exported functions and exported function-valued variables only when
  they declare an explicit `Effect.Effect<...>` return type.
- Inspect methods returned from an `Effect.Service` `effect` or `scoped`
  implementation when their returned expression is syntactically an Effect
  call or an Effect pipeline.
- Require `Effect.withSpan(...)` as part of that method or function's returned
  Effect expression, including a `.pipe(Effect.withSpan(...))` form.
- Do not infer Effect types, resolve aliases, trace delegations, require spans
  on constructors/layers, or apply path-based exemptions.

## Integration

- Add `testingObservabilityAndQaRules`, `testingObservabilityAndQa`, and the
  matching `ruleGroups` entry. Preserve `recommended = allRules`.
- Add direct unit tests, exact Oxlint CLI diagnostics, valid/invalid fixtures,
  and `EXPECT`/`QA` annotated backend examples for each rule.
- Add concise README entries and complete Roadmap 08 Slice 1 after the full
  package verification gate passes.
- No dependency, release-version, or changeset update is part of this slice.

## Verification

Run `bun run test`, `bun run typecheck`, `bun run docs:api:check`, `bun run
build`, `bun run lint`, `bun run size`, `bun run pack:dry-run`, and `git diff
--check`. `bun run lint:examples` is expected to report annotated anti-patterns
and exit non-zero.
