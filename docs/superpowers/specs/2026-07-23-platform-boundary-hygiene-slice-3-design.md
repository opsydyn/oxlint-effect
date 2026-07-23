# Platform And Boundary Hygiene Slice 3 Design

## Goal

Complete the Platform and Boundary Hygiene group with two conservative rules:

- `linteffect/no-new-date-in-domain-logic`
- `linteffect/no-boundary-try-catch-without-effect-map`

## no-new-date-in-domain-logic

The rule is Effect-import-gated. In a module importing from the Effect
ecosystem, it reports `new Date()` and `new Date(value)` outside a configured
runtime boundary. It uses the existing `boundaryPaths` option and defaults from
Slice 2, so application entrypoints, routes, servers, CLI files, scripts, and
tests remain allowed.

It does not use folder-name heuristics, type analysis, alias tracing, or date
data-flow analysis. It does not report `DateTime`, `Clock`, or other non-`new
Date` APIs. The diagnostic directs callers to model time with Effect Clock or
DateTime and inject time at the boundary.

## no-boundary-try-catch-without-effect-map

The rule only examines `TryStatement` nodes in configured boundary paths. It
reports a catch boundary when neither the try block nor the catch handler
contains a direct Effect error-translation or execution shape.

Allowed direct shapes are `Effect.try`, `Effect.tryPromise`, `Effect.mapError`,
`Effect.catchAll`, `Effect.catchTag`, `Effect.catchTags`, and `Effect.run*`.
The rule searches only the local AST subtree for these direct member-call
forms. It does not infer aliases, inspect control flow, or validate the error
mapping payload.

## Public API And Documentation

Register both rules, add them to `platformAndBoundaryHygieneRules`, and retain
the existing `recommended = allRules` contract. Document their roadmap default
as `ddd` for time modelling and `strict` for boundary catch handling.

Every rule requires direct unit tests, explicit Oxlint fixture configuration
and CLI assertions, valid/invalid fixture evidence, and annotated backend
anti-pattern code with `EXPECT` and `QA` comments. Update the README and mark
Slice 3 and the Platform group complete in the roadmap. No changeset is added
until a release is requested.

## Verification

Run `bun run test`, `bun run typecheck`, `bun run docs:api:check`, `bun run
build`, `bun run lint`, `bun run size`, `bun run pack:dry-run`, and `git diff
--check` before completion. Example linting intentionally exits nonzero due to
the anti-pattern corpus; assert its expected diagnostics rather than treating
that exit status as a failure.
