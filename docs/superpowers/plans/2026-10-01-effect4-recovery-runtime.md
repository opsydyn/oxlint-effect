# Effect 4 Recovery And Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Preserve the user's inline execution and direct-main preferences.

**Goal:** Qualify three recovery/runtime rules against pinned Effect 3 and Effect 4 consumers, with visible anti-patterns and clean controls.

**Architecture:** Keep stable rule IDs and the existing syntax-based implementation. Select plain recovery operators and executable runner shapes using each rule context's validated `effectVersion`; share runner recognition without conflating a context factory with execution. Extend the existing packed-consumer gate rather than introduce another install harness.

**Tech Stack:** TypeScript, Bun tests, Oxlint 1.71.0 JavaScript plugins, Effect 3.21.4 and 4.0.0, tsdown.

**Spec:** [Approved compatibility design](../specs/2026-10-01-effect4-first-class-design.md); [three-rule allocation](../../../roadmap/14-effect4-compatibility/recovery-runtime-batch.md).

## Global Constraints

- Plugin name, package specifier and stable rule IDs remain `linteffect` and `@opsydyn/oxlint-effect`.
- Version-sensitive rules accept a validated `effectVersion: 3 | 4` option, defaulting to 4 when manually enabled without options.
- Do not detect an Effect version by reading node_modules, a lockfile or a package manifest during rule execution.
- Do not ship an Effect runtime dependency inside the plugin.
- `typeAware` remains opt-in for both majors and does not enable compiler diagnostics or convert syntax rules into custom typed rules.
- Preserve Effect 3 messages; the runner boundary exemption is an explicitly documented contract correction for both majors.
- Do not publish an intermediate v4 default while major groups remain unaudited. Package stays at 1.2.0; eventual breaking release is 2.0.0.
- Keep the 27 KB package size gate. Do not silently raise it to accommodate this slice.

## Review Focus

1. Context-factory creation must not warn, and immediate curried execution must warn exactly once (Task 2).
2. Per-file majors and custom boundary paths must not leak across files in one process; replacement paths must not retain defaults (Tasks 2 and 3).
3. Cause, defect, filtered and reason recovery must not become plain-catch matches; nested unrelated callback returns must not be attributed to the enclosing handler (Task 1).
4. Shared resource/provisioning detectors must use the executed program, not the context argument, and must not mistake supplied context for missing Layer provision (Task 2).
5. Examples must typecheck without casts hiding invalid Effect 4 signatures; clean recovery must retain the original error identity at runtime (Task 3).

## Scope And Files

- Modify `src/index.ts`: version-aware recovery and runner helpers, three headline rules and four transitive runner consumers. Import `effectVersionFor` from the existing `src/effect-version.ts`; no module reorganisation.
- Modify `tests/plugin.test.ts`: synthetic positive/negative shape and path regressions using the existing `runRule`/`runRuleSequence` harness.
- Modify `scripts/verify-effect-version-consumers.ts`: run isolated batch configurations and runtime contracts in each already installed packed consumer.
- Modify `tests/effect-version-consumer.test.ts` only if new harness logic needs unit coverage; retain strict JSON diagnostic parsing.
- Create the following in **each** of `examples/effect3-consumer/` and `examples/effect4-consumer/`: `oxlint.recovery-runtime.config.ts`, `src/recovery-runtime/rethrow.ts`, `fallback.ts`, `runners.ts`, `valid.ts`, `contracts.ts`, `main.ts`, `custom-entry.ts`, and `expected-diagnostics.recovery-runtime.json`.
- Modify `examples/backend/public-error-contract-anti-patterns.ts` and `examples/backend/platform-boundary-hygiene-anti-patterns.ts`: label/add legacy bad examples and clean controls. The packed Effect 4 consumer is the first-class v4 reference; do not migrate unrelated v3 reference-app dependencies.
- Modify `README.md`, `docs/effect-version-inventory.json`, `roadmap/14-effect4-compatibility/README.md`, and `roadmap/14-effect4-compatibility/recovery-runtime-batch.md`.
- Create `docs/superpowers/reports/2026-10-01-effect4-recovery-runtime-qualification.md` with command results and remaining limits.

## Task 1: Version-Aware Plain Recovery

**Interfaces:**
- Consume `effectVersionFor(options: readonly unknown[]): EffectVersion`.
- Produce `plainCatchOperators(version: EffectVersion): ReadonlySet<string>` selecting only `catchAll` for 3 and `catch` for 4.
- Change `catchAllGenericRethrow(node: unknown, version: EffectVersion): unknown | undefined` and `earlyCatchAllFallback(node: unknown, version: EffectVersion): unknown | undefined`.
- Keep `errorHandlerCallbacks(node, operators)` usable by unrelated rules; do not globally replace other recovery tables.

- [x] Add tests named `plain recovery selects its configured major`, `plain recovery rejects distinct recovery contracts`, and `plain recovery ignores nested unrelated callback returns`. Assert rethrow reports exactly 2 and fallback exactly 3 for each major, spanning data-first/piped and expression/block-return forms; opposite-major spelling and unrelated receivers produce 0. Check report nodes as well as counts.
- [x] Run `bun test tests/plugin.test.ts --test-name-pattern 'plain recovery'`; expect missing v4 diagnostics before implementation. Record the failure.
- [x] Implement the interfaces and resolve the version once per headline rule's `create`. Retain v3 diagnostic text; v4 rethrow text names `catch`. Restrict return inspection to the handler's own function scope if the tests expose nested callback contamination, without changing unrelated return-walking callers.
- [x] Add tests named `early recovery honours versioned boundary paths`: null/undefined/named fallback warns in domain files, not default boundaries; custom paths replace defaults and empty paths exempt nothing. Keep tagged-error/original-error propagation and unrelated succeed values clean.
- [x] Run `bun test tests/plugin.test.ts` and `bun run typecheck`; expect passing existing v3 tests and new recovery controls.
- [x] Commit only this task's source/tests: `git commit -m "feat: recognise versioned Effect recovery operators"` after staging the explicit files.

## Task 2: Executable Runners And Boundary Contract

**Installed API evidence:** Effect 4.0.0 `src/Effect.ts` declares all six `run*With` forms as `context => (effect, options?) => result`. `runCallbackWith` accepts an `onExit` options object; its returned interruptor is not another Effect execution.

**Interfaces:**
- Produce `effectRunExecution(node: unknown, version: EffectVersion): { program: unknown; hasContext: boolean } | undefined` for direct existing runners and immediate `Effect.run*With(context)(program, options?)` execution.
- Change `isEffectRunCall(node: unknown, version: EffectVersion): boolean` to delegate to that descriptor. All callers pass their own rule's version explicitly.
- Thread `version` through `containsBoundaryEffectHandling(node: unknown, version: EffectVersion, seen?: WeakSet<object>): boolean` and `effectRunMissingLayerProvision(node: unknown, version: EffectVersion): boolean`.
- Existing runner methods: `runCallback`, `runFork`, `runPromise`, `runPromiseExit`, `runSync`, `runSyncExit`. Version 4 alone adds corresponding `With` execution shapes.
- Add `boundaryPathOptionsSchema` to `noRunEffectOutsideBoundary`, composed with the existing version schema, and apply `isBoundaryPath(context)`.

- [x] Add tests named `versioned runners distinguish factories from execution`: exactly 6 ordinary execution reports under each major, another 6 immediate With reports only under v4, 0 for factory creation, unrelated receivers and invoking a returned callback interruptor. Test default/manual v4 and explicit v3. Run the focused test and record RED.
- [x] Add `runner boundary paths replace defaults` tests for all existing defaults: `bin/**`, `scripts/**`, `cli/**`, `**/main.ts`, `app/api/**/route.ts`, `server/**`, `*.test.ts`, `*.spec.ts`. Test custom-only replacement, empty array, normalised Windows separators and domain negative controls.
- [x] Implement the descriptor and boundary exemption. A With factory alone returns undefined; only its immediately enclosing execution call returns a descriptor. Do not add stored runner alias, computed property or import alias resolution in this batch; document these limits explicitly.
- [x] Adapt `no-hidden-effect-execution`, `no-boundary-try-catch-without-effect-map`, `no-run-with-open-resource` and `no-missing-layer-provision-at-run` to explicit version arguments. For missing Layer provision, inspect `descriptor.program` and conservatively return false when `hasContext` is true: explicit context supplies an environment, and syntax cannot prove its completeness. Do not claim context completeness or lifetime safety.
- [x] Add `shared runner consumers preserve execution semantics` tests: hidden execution reports With once; boundary try/catch recognises executed With but not factory creation; open-resource execution reports With once; missing provision still reports ordinary unprovided service programs and does not report context-supplied executions. Retain all v3 regression controls. Do not rename boundary recovery tables or qualify other recovery operators here.
- [x] Run `bun test tests/plugin.test.ts`, `bun run typecheck` and `bun run size`; expect passing tests/types and size below 27 KB. Review any optimisation separately if size exceeds the cap.
- [x] Commit explicit source/test files: `git commit -m "fix: enforce versioned runner boundary contracts"`.

## Task 3: Packed QA, Anti-Patterns And Documentation

**Interfaces:**
- Reuse `verifyLint(root, config, files, expected, status, expectedByFile?)` and `assertDiagnosticCountsByFile`; no rendered-output matching.
- `oxlint.recovery-runtime.config.ts` uses the packed plugin, disables builtin categories, and enables one headline rule for each matching source file. Supply explicit major in each tuple; custom-entry overrides use `boundaryPaths: ["**/custom-entry.ts"]` and retain that major.
- `expected-diagnostics.recovery-runtime.json` stores literal per-file counts, not counts derived from the actual diagnostics. Rethrow: 2; fallback: 3; runners: 6 for v3, 12 for v4. Clean/control files have no reports.
- `contracts.ts` is a typechecked, directly executable Bun script using the installed Effect package and simple throwing assertions; no new dependency or global Bun types needed.

- [x] Create annotated bad and clean fixtures in both consumers. Tag each problematic expression with its rule ID. Use each major's real recovery spelling, Error subclasses with discriminants for clean mappings, and typed Context values for all six v4 With forms. Export runner anti-pattern functions without invoking them; constructing a With factory alone is clean.
- [x] Include default `main.ts` boundary controls and custom-entry controls containing both fallback recovery and execution. Add a custom-path configuration probe in the same process where `main.ts` becomes non-boundary, plus mixed-major per-file controls for both headline recovery rules. For those recovery controls, duplicate valid installed-major syntax into two files and select opposite rule policies: matching policy must warn and opposite policy must not. Do not call unavailable APIs merely to demonstrate an override. Keep the existing cross-negative mixed runner probes so unioning global paths cannot pass.
- [x] Extend the packed harness to lint each rule's bad file, all clean files, and custom/mixed override probes with exact totals AND filenames. Invoke `bun src/recovery-runtime/contracts.ts` in each packed consumer. Initially run `bun run test:effect-versions` and record any missing warnings or type failures before adjusting fixtures/harness.
- [x] Runtime contracts: run an original structured failure through propagation and assert recovered error identity is unchanged; assert tagged mapping retains its source cause; assert permitted boundary fallback returns the intended value. Use `runPromiseExit` and stable Exit inspection per major, not textual error-message comparisons. Runtime tests execute controls only, never domain runner anti-patterns.
- [x] Add/label legacy reference-app annotations and clean counterparts in the two named backend files. Keep intentionally bad code bad and do not suppress the warnings. Ensure expected legacy CLI diagnostic counts are updated if these additions affect existing fixture gates.
- [x] Update README rule rows and a short v4/v3 recovery/runtime section: `catch` versus `catchAll`, ordinary versus curried With execution, actual boundary defaults and replacement semantics, explicit version retention in custom tuples, stable IDs, no migration warning for legacy spelling, and bounded alias support. Link installed-API evidence to primary Effect documentation in the qualification report.
- [x] Mark only the three headline inventory entries qualified for both majors with exact evidence paths/variant scope. Record shared runner regressions without marking their whole rules/groups qualified. Record stored-runner alias support and test-shape `runPromiseWith` recognition as follow-on coverage, not completed work.
- [x] Run the final gates: `bun run test`, `bun run typecheck`, `bun run test:effect-versions`, `bun run test:type-aware`, `bun run build`, `bun run lint`, `bun run docs:api:check`, `bun run size`, `bun run pack:dry-run`, and `git diff --check`. Expect all passing. Run `bun scripts/verify-effect-version-release.ts`; expect exit 1 because the remaining inventory and package major still block publication.
- [x] Write the qualification report with exact results, scope limits, intentional runner correction and pending groups. Update the batch/roadmap status and this plan's completed checkboxes only after evidence passes.
- [x] Obtain one fresh whole-batch code review using the requesting-code-review skill. Address verified findings, rerun affected and final gates, and preserve review rulings in the report. Do not treat review or local tests as remote CI/npm publication evidence.
- [x] Stage explicit changed files and commit: `git commit -m "test: qualify recovery and runtime across Effect majors"`. Leave `main` clean; do not push or publish without a separate request.

## Plan Self-Review

The approved batch is covered by Tasks 1-3; all five review risks have owning tests. Shared runner interfaces carry explicit policy rather than mutable global state. Qualification remains scoped to the three rules, with other recovery tables and test-shape runners explicitly pending. Broad service/concurrency/domain migration, companion-skill migration and release qualification remain later roadmap work.
