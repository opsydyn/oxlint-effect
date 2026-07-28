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

- [ ] Add `linteffect/no-new-date-in-domain-logic` beside the existing date rule. Its schema must use `boundaryPathOptionsSchema`, and its message must direct users to inject `Clock` or model time at the boundary.
- [ ] Collect `NewExpression` nodes whose callee is the identifier `Date`; at `Program:exit`, report candidates only when the file imports an Effect ecosystem package and `isBoundaryPath(context)` is false.
- [ ] Register it in `rules` and add it to `dddRules`; retain the existing all-rules `recommended` preset.
- [ ] Add unit tests for `new Date()` and `new Date(value)`, late Effect imports, default boundary exemption, replacement `boundaryPaths`, non-Effect modules, and non-`Date` constructors.
- [ ] Update config group expectations, including the exact generated `recommended.rules` object.

**Commit:** `Add domain time boundary rule`

### Task 2: Add mapped boundary catch rule

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`
- Modify: `tests/config.test.ts`

- [ ] Add `linteffect/no-boundary-try-catch-without-effect-map`, with `boundaryPathOptionsSchema` and a message directing users to map failures through Effect before execution.
- [ ] Add a recursive local-AST helper that recognises direct `Effect.try`, `Effect.tryPromise`, `Effect.mapError`, `Effect.catchAll`, `Effect.catchTag`, `Effect.catchTags`, and existing `Effect.run*` calls. Skip `parent` fields and protect recursion with `WeakSet`.
- [ ] In the rule's `TryStatement` visitor, return unless `isBoundaryPath(context)` is true. Report a `try`/`catch` when its subtree has none of the allowed direct calls. Do not attempt alias, import-alias, callback-order, or data-flow analysis.
- [ ] Register it in `rules` and `strictRules`, preserving `recommended` coverage.
- [ ] Add unit tests for a raw boundary catch report; direct `Effect.tryPromise`, `Effect.mapError`, and `Effect.runPromise` acceptance; shared-module exemption; and custom boundary replacement.
- [ ] Update config group and generated-preset expectations.

**Commit:** `Add boundary catch mapping rule`

### Task 3: Prove CLI, examples, documentation, and roadmap

**Files:**
- Modify: `tests/fixtures/oxlint/oxlint.config.ts`
- Create: `tests/fixtures/oxlint/platform-time-invalid.ts`
- Create: `tests/fixtures/oxlint/server/platform-catch-invalid.ts`
- Create: `tests/fixtures/oxlint/server/platform-time-and-catch-allowed.ts`
- Modify: `tests/oxlint.integration.test.ts`
- Modify: `examples/backend/platform-boundary-hygiene-anti-patterns.ts`
- Modify: `examples/oxlint.config.ts`
- Modify: `README.md`
- Modify: `roadmap/07-platform-and-boundary-hygiene/README.md`

- [ ] Enable both rules explicitly in the integration fixture config.
- [ ] Add a shared Effect fixture with `new Date()` that reports only the time rule, a `server/` fixture with raw `try`/`catch` that reports only the catch rule, and an allowed server fixture using `new Date()` plus `Effect.tryPromise` that stays clean.
- [ ] Add CLI assertions for exact rule IDs and clean allowed output. Do not expect `bun run lint:examples` to exit zero; it intentionally validates a warning corpus.
- [ ] Append `EXPECT` and `QA` annotations for both anti-patterns. In `examples/oxlint.config.ts`, spread `allRules` and override only the catch rule's `boundaryPaths` with `examples/backend/platform-boundary-hygiene-anti-patterns.ts`; this makes the boundary-only warning observable without exempting the example's time warning.
- [ ] Add concise README entries under Domain-Driven Design and Platform and Boundary Hygiene, including default scope and configuration guidance.
- [ ] Mark the Slice 3 checklist complete and the roadmap group complete only after the checks below pass.

**Commit:** `Document platform boundary hygiene slice 3`

### Task 4: Verify and prepare the implementation series

**Files:**
- Verify only

- [ ] Run `bun run test`.
- [ ] Run `bun run typecheck`.
- [ ] Run `bun run docs:api:check`.
- [ ] Run `bun run build`.
- [ ] Run `bun run lint`.
- [ ] Run `bun run size`.
- [ ] Run `bun run pack:dry-run`.
- [ ] Run `git diff --check` and inspect `git status --short` before the final commit.

## Plan Review

- [ ] Coverage: both rules have direct positive, direct negative, options, config-group, integration, and observable-example coverage.
- [ ] Scope: no dependency, release-version, or unrelated rule changes are planned.
- [ ] Semantics: time detection is import-gated; catch detection is boundary-only; the fixture paths demonstrate each distinction independently.
- [ ] Types: reuse existing `Node`, context, schema, and `WeakSet` patterns rather than introducing an untyped traversal API.
