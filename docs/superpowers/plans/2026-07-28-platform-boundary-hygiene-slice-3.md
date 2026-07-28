# Platform And Boundary Hygiene Slice 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Complete Platform and Boundary Hygiene with conservative rules for wall-clock construction in Effect modules and unmapped boundary `try`/`catch` blocks.

**Architecture:** Reuse Slice 2's `isBoundaryPath(context)`, `boundaryPathOptionsSchema`, and Effect ecosystem import detection. The time rule collects `NewExpression` candidates and reports at `Program:exit` once imports are known. The catch rule visits `TryStatement` only for configured boundary files, scanning its local AST subtree for direct allowed Effect member calls without aliases, control-flow, or data-flow inference.

**Tech Stack:** TypeScript, `@oxlint/plugins`, Bun test, Oxlint CLI, TypeDoc, tsdown, publint.

## Guardrails

- Keep both rules AST-only and conservative.
- `no-new-date-in-domain-logic` is Effect-import-gated and exempt only in configured runtime boundaries.
- `no-boundary-try-catch-without-effect-map` reports only in configured boundaries and accepts only direct `Effect` calls listed below.
- Preserve `recommended = allRules`; no changeset is needed for this implementation slice.
- Every rule must have annotated anti-pattern source in `examples/` and direct unit plus CLI integration coverage.

### Task 1: Add Effect-domain wall-clock rule

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`
- Modify: `tests/config.test.ts`

- [x] Add `linteffect/no-new-date-in-domain-logic` beside the existing date rule. Its schema must use `boundaryPathOptionsSchema`, and its message must direct users to inject `Clock` or model time at the boundary.
- [x] Collect `NewExpression` nodes whose callee is the identifier `Date`; at `Program:exit`, report candidates only when the file imports an Effect ecosystem package and `isBoundaryPath(context)` is false.
- [x] Register it in `rules` and add it to `dddRules`; retain the existing all-rules `recommended` preset.
- [x] Add unit tests for `new Date()` and `new Date(value)`, late Effect imports, default boundary exemption, replacement `boundaryPaths`, non-Effect modules, and non-`Date` constructors.
- [x] Update config group expectations, including the exact generated `recommended.rules` object.

**Commit:** `Add domain time boundary rule`

### Task 2: Add mapped boundary catch rule

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`
- Modify: `tests/config.test.ts`

- [x] Add `linteffect/no-boundary-try-catch-without-effect-map`, with `boundaryPathOptionsSchema` and a message directing users to map failures through Effect before execution.
- [x] Add a recursive local-AST helper that recognises direct `Effect.try`, `Effect.tryPromise`, `Effect.mapError`, `Effect.catchAll`, `Effect.catchTag`, `Effect.catchTags`, and existing `Effect.run*` calls. Skip `parent` fields and protect recursion with `WeakSet`.
- [x] In the rule's `TryStatement` visitor, return unless `isBoundaryPath(context)` is true. Report a `try`/`catch` when its subtree has none of the allowed direct calls. Do not attempt alias, import-alias, callback-order, or data-flow analysis.
- [x] Register it in `rules` and `platformAndBoundaryHygieneRules`, preserving `recommended` coverage. The package has no standalone `strictRules` export.
- [x] Add unit tests for a raw boundary catch report; direct `Effect.tryPromise`, `Effect.mapError`, and `Effect.runPromise` acceptance; shared-module exemption; and custom boundary replacement.
- [x] Update config group and generated-preset expectations.

**Commit:** `Add boundary catch mapping rule`

### Task 3: Prove CLI, examples, documentation, and roadmap

**Files:**
- Modify: `tests/fixtures/oxlint/oxlint.config.ts`
- Create: `tests/fixtures/oxlint/oxlint.platform-slice-3.config.ts`
- Create: `tests/fixtures/oxlint/platform-time-invalid.ts`
- Create: `tests/fixtures/oxlint/server/platform-catch-invalid.ts`
- Create: `tests/fixtures/oxlint/server/platform-time-and-catch-allowed.ts`
- Modify: `tests/oxlint.integration.test.ts`
- Modify: `examples/backend/platform-boundary-hygiene-anti-patterns.ts`
- Modify: `examples/oxlint.config.ts`
- Modify: `README.md`
- Modify: `roadmap/07-platform-and-boundary-hygiene/README.md`

- [x] Enable both rules explicitly in the integration fixture configs.
- [x] Add a shared Effect fixture with `new Date()` that reports only the time rule, a `server/` fixture with raw `try`/`catch` that reports only the catch rule, and an allowed server fixture using `new Date()` plus `Effect.tryPromise` that stays clean.
- [x] Add CLI assertions for exact rule IDs and clean allowed output. Do not expect `bun run lint:examples` to exit zero; it intentionally validates a warning corpus.
- [x] Append `EXPECT` and `QA` annotations for both anti-patterns. In `examples/oxlint.config.ts`, spread `allRules` and override only the catch rule's `boundaryPaths` with `examples/backend/platform-boundary-hygiene-anti-patterns.ts`; this makes the boundary-only warning observable without exempting the example's time warning.
- [x] Add concise README entries under Domain-Driven Design and Platform and Boundary Hygiene, including default scope and configuration guidance.
- [x] Mark the Slice 3 checklist complete and the roadmap group complete after CLI coverage and example-corpus diagnostics pass.

**Commit:** `Document platform boundary hygiene slice 3`

### Task 4: Verify and prepare the implementation series

**Files:**
- Verify only

- [x] Run `bun run test`.
- [x] Run `bun run typecheck`.
- [x] Run `bun run docs:api:check`.
- [x] Run `bun run build`.
- [x] Run `bun run lint`.
- [x] Run `bun run size`.
- [x] Run `bun run pack:dry-run`.
- [x] Run `git diff --check` and inspect `git status --short` before the final commit.

## Plan Review

- [x] Coverage: both rules have direct positive, direct negative, options, config-group, integration, and observable-example coverage.
- [x] Scope: no dependency, release-version, or unrelated rule changes are planned.
- [x] Semantics: time detection is import-gated; catch detection is boundary-only; the fixture paths demonstrate each distinction independently.
- [x] Types: reuse existing `Node`, context, schema, and `WeakSet` patterns rather than introducing an untyped traversal API.
