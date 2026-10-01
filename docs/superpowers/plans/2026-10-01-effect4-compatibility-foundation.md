# Effect 4 Compatibility Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish Effect 4 default configuration, explicit Effect 3 legacy configuration and packed dual-version QA without claiming the remaining detectors are v4-ready.

**Architecture:** Keep one plugin and the existing rule implementation structure. Introduce a small version-policy module for option parsing and schema composition, preserve existing group membership as the legacy baseline, and track every rule's qualification independently of its registration. Packed consumers exercise the exported configuration and actual warnings in isolated dependency trees.

**Tech Stack:** TypeScript, Bun tests, Oxlint, tsdown, npm pack, GitHub Actions; pinned consumer Effect versions 3.21.4 and 4.0.0.

**Spec:** [Effect 4 first-class design](../specs/2026-10-01-effect4-first-class-design.md).

## Global Constraints

- Default policy is Effect 4; the named `effect3` namespace is the legacy path.
- `effectVersion: 3 | 4` defaults to 4 on version-sensitive manually enabled rules.
- Version-neutral rules retain their existing options and behaviour.
- One package and plugin registration: `@opsydyn/oxlint-effect`, `linteffect`.
- `typeAware` remains opt-in for both majors; custom rules remain syntax-only.
- No consumer-version discovery from manifests, lockfiles or node_modules.
- Preserve boundary defaults, strict/recommended policy and legacy diagnostics.
- Every rule batch includes annotated failures, clean controls and documentation.
- No intermediate v4-default publication; all applicable groups must qualify before 2.0.0.
- Commit each verified task; do not push, publish or alter release credentials in this plan.

## Scope And Sequencing

This plan implements roadmap Slice 1 only. Recovery, concurrency, services,
remaining groups and the complete companion corpus get subsequent bounded plans
based on the audit inventory. Those plans must retain the three-rule batch
preference and cover shared-helper regressions beyond the headline rules.

The foundation can exist locally with v4 entries marked pending. Passing this
plan proves the configuration contract and QA harness, not Effect 4 readiness.
Keep root development dependencies and existing v3 examples intact during this
slice; select `effect3` explicitly wherever existing QA relies on v3 presets.
Move primary examples and guidance to v4 in the corresponding adaptation batches.

## Review Focus

1. User overrides replace preset tuples: custom boundary paths and severity must retain an explicit legacy version (Tasks 2 and 3).
2. The same rule runs in v3 and v4 overrides in one process: policy cannot leak between files (Tasks 1 and 3).
3. A warning disappears or repeats: counts, not merely rule-ID sets, must fail QA (Task 3).
4. A registered legacy-only rule is absent from v4 `allRules`: registration, applicability and qualification remain distinct (Tasks 2 and 4).
5. A source import passes while the published declaration fails: both configurations must typecheck against the tarball using `defineConfig` (Task 3).

## File Responsibilities

- `src/effect-version.ts` (new): major type, validated option lookup and option-schema composition only; not API detector tables.
- `src/index.ts`: current rules, group names, preset generation and public exports; no broad rule-file refactor.
- `docs/effect-version-inventory.json` (new): per-rule major applicability, sensitivity, evidence and qualification state.
- `tests/effect-version.test.ts` (new): option/schema and inventory contracts.
- `tests/config.test.ts`: default/legacy exports and applicable membership.
- `tests/effect-version-consumer.test.ts` (new): diagnostic multiset and harness failure tests.
- `scripts/effect-version-consumer.ts` (new): testable diagnostic counting/validation utilities.
- `scripts/verify-effect-version-consumers.ts` (new): pack once, stage consumers, install, typecheck and lint; explicit major selection CLI.
- `examples/effect3-consumer/` and `examples/effect4-consumer/` (new): independent manifests, lockfiles, configs, annotated source and clean controls.
- `.github/workflows/ci.yml`, `package.json`: dual-version QA command and matrix, preserving existing jobs.
- `README.md`, `roadmap/14-effect4-compatibility/README.md`: provisional configuration guidance and verified task status.

### Task 1: Version Options And Complete Audit Inventory

**Files:** Create `src/effect-version.ts`, `tests/effect-version.test.ts`, `docs/effect-version-inventory.json`; modify `src/index.ts`.

**Interfaces:**
- `EffectVersion = 3 | 4`.
- `effectVersionFor(options: readonly unknown[]): EffectVersion`: absent field returns 4; invalid present field throws a configuration error.
- `withEffectVersionSchema(schema: readonly unknown[]): readonly unknown[]`: compose an integer enum `[3, 4]` into the first object option schema, preserving existing properties and `additionalProperties: false`; handle the absent-schema case.
- Inventory entry: `{ sensitive: boolean, applicability: { "3": boolean, "4": boolean }, qualification: { "3": "baseline" | "pending" | "qualified" | "not-applicable", "4": "pending" | "qualified" | "not-applicable" }, evidence: string[] }`, keyed by unprefixed registered rule ID.

- [ ] Write tests named `defaults to four`, `accepts three and four`, `rejects invalid versions`, `preserves boundary and config path schemas`, and `does not share version state`. Assert rejection of `2`, `5`, `"3"`, `null`; alternate calls with versions 3 and 4; assert composed schemas retain existing properties.
- [ ] Run `bun test tests/effect-version.test.ts`; confirm failure because the module/inventory does not exist.
- [ ] Implement the module using the existing structured option handling. Inspect every registered rule and its shared helper dependencies; populate every inventory entry with code/reference evidence. Conservatively leave v4 qualification pending where evidence is incomplete. Classify `require-service-accessors` and `require-service-dependencies` as v3-only. Do not infer neutrality from rule names alone.
- [ ] Add inventory assertions: keys exactly equal `Object.keys(plugin.rules)`; no duplicates or unknown states; not-applicable entries have applicability false; every entry has evidence. Add a regression case showing a newly registered rule without an inventory entry fails.
- [ ] Attach composed schemas to each identified sensitive rule without changing its detector yet. Run real Oxlint invalid-option checks for a sensitive rule with no prior schema and one with `boundaryPaths`; valid `effectVersion` and paths must load, invalid versions must exit nonzero before successful lint. Direct helper tests alone do not prove Oxlint schema validation.
- [ ] Run `bun test tests/effect-version.test.ts`, `bun run typecheck` and `bun run test`; preserve current detection while recording pending adaptation explicitly.
- [ ] Commit scoped files: `feat: establish Effect version policy and audit inventory`.

### Task 2: Default And Legacy Export Contracts

**Files:** Modify `src/index.ts`, `tests/config.test.ts`, existing v3 fixture configs under `tests/fixtures/oxlint/`, `examples/oxlint.config.ts` and v3 preset consumers identified by `rg`; modify `README.md`.

**Interfaces:**
- Export `EffectVersion`, `EffectRuleOptions = { effectVersion?: EffectVersion; boundaryPaths?: readonly string[]; configPaths?: readonly string[] }` and `EffectRuleEntry = "error" | readonly ["error", EffectRuleOptions]`.
- `rulesFromNames(names, version)` uses the inventory's applicability and sensitivity. Sensitive rules receive `["error", { effectVersion: version }]`; neutral rules remain `"error"`. Preserve literal rule-key inference rather than widening all keys to arbitrary strings.
- `presetFor(groupRules)` accepts option tuples and shares `jsPlugins`.
- Export `effect3` containing all existing group presets/rules companions plus `recommended`, `recommendedRules`, `allRules`, `ruleGroups`, `presets`, `typeAware`, `jsPlugins`.

- [ ] Write failing config tests: `default maps select four`, `legacy maps select three`, `legacy namespace exposes every companion`, `legacy membership preserves baseline`, `allRules excludes v4-inapplicable rules`, `strict exclusions survive both majors`, and `typeAware remains opt in`. Assert shared plugin registration and v3-only service rule exclusions from v4 maps, not from `plugin.rules`.
- [ ] Run `bun test tests/config.test.ts`; confirm the new namespace/tuple expectations fail.
- [ ] Implement versioned map generation with the Task 1 inventory. Reuse existing group rule-name lists, strict lists and DDD unions for both majors. Generate `effect3` without recursion or a second plugin. Pending v4 applicability stays visible as pending in the audit, never described as qualified.
- [ ] Update existing v3 fixture preset imports to `effect3`; retain their previous expected diagnostics. Update severity-only test helpers to inspect tuple policy without erasing rule keys. Keep manual rule tests explicit about major when they test legacy API behaviour.
- [ ] Add README examples for v4 `ddd`, v3 `effect3.ddd`, rules-only imports, manual sensitive rules and custom-path overrides. Show `jsPlugins: [...ddd.jsPlugins]` for the current readonly registration type; preserve existing user-land workaround. Label this as unreleased 2.0 migration work with v4 qualification incomplete.
- [ ] Run `bun test tests/config.test.ts tests/oxlint.integration.test.ts`, `bun run typecheck`, `bun run build`, `bun run docs:api:check` and `bun run test`.
- [ ] Commit scoped changes: `feat: expose Effect 3 legacy presets alongside v4 policy`.

### Task 3: Packed Dual-Version Consumers And Exact Warnings

**Files:** Create the consumer scripts/test and both consumer directories listed above; modify `package.json`.

**Interfaces:**
- `diagnosticCounts(output: string): Record<string, number>` counts every `linteffect(rule)` occurrence; it must not deduplicate repeated warnings.
- `assertDiagnosticCounts(actual, expected): void` rejects missing, extra and wrong-count diagnostics.
- `bun scripts/verify-effect-version-consumers.ts --effect-version 3|4` verifies exactly one pinned consumer; no argument verifies both. Unknown arguments fail.
- Public command `test:effect-versions`: `bun run build && bun scripts/verify-effect-version-consumers.ts`.
- Each consumer has `package.json`, `bun.lock`, `tsconfig.json`, `oxlint.config.ts`, `src/failures.ts`, `src/valid.ts`, `src/config-contract.ts` and `expected-diagnostics.json`.

- [ ] Write harness unit tests for two occurrences of the same rule, missing/extra warnings, wrong counts, malformed expectations and child-process install/typecheck failures. Assert a missing expected warning is never accepted as a clean run. Run `bun test tests/effect-version-consumer.test.ts` and confirm red.
- [ ] Implement the helpers and staging script following `scripts/verify-type-aware-consumer.ts`: isolated temporary roots/cache, pack the built package once, structured manifest parsing, checked command statuses and cleanup in `finally`. Preserve failed command output in the thrown error.
- [ ] Pin Effect 3.21.4 and 4.0.0 respectively; pin identical Oxlint 1.71.0 and TypeScript 5.9.3 in both consumers. Commit generated Bun lockfiles. Stage each consumer, use its frozen lockfile to install dependencies, then install the tarball locally without silently refreshing ecosystem dependencies; assert the resolved package/version and Effect major before QA.
- [ ] Create one version-neutral baseline rule example per consumer using `no-effect-fail-error-message`: two annotated `Effect.fail(error.message)` failures and a clean typed-error control. Typecheck both against their actual major. Enable only this rule for this foundation probe so pending v4 detectors cannot masquerade as qualified. Assert exactly two warnings and clean exit zero for the control.
- [ ] Add packed `defineConfig` type controls using the recommended/group/rules-only exports, readonly `jsPlugins` spread and a sensitive-rule custom-boundary tuple for each major. Assert invalid version options fail TypeScript via `@ts-expect-error` where the exported type applies; separately run invalid options through Oxlint.
- [ ] Add mixed-major overrides in one staged Oxlint config, one file per major. Assert valid loading, explicit policy values and boundary behaviour with a version-sensitive boundary rule. Revisit semantic cross-major recovery/fork assertions when those detectors are adapted; do not claim this loading test proves them.
- [ ] Run `bun test tests/effect-version-consumer.test.ts`, `bun run test:effect-versions` and `bun run test:type-aware`. Require bad lint exit 1, exact warning counts, both consumer typechecks zero and both clean lint controls zero.
- [ ] Commit scoped files: `test: qualify packed Effect 3 and Effect 4 configuration`.

### Task 4: CI, Foundation Gate And Next Batch Allocation

**Files:** Modify `.github/workflows/ci.yml`, `tests/effect-version.test.ts`, `docs/effect-version-inventory.json`, `roadmap/14-effect4-compatibility/README.md`, `README.md`.

**Interfaces:** CI adds `effect-version` matrix `[3, 4]`, Node 22 and root frozen install, build then the Task 3 major-specific command. Existing build and type-aware jobs remain.

- [ ] Add inventory tests proving `pending` v4 rows remain pending even when the foundation probe passes; a legacy-only rule cannot accidentally enter v4 `allRules`; every exported group has an auditable set of inventory rows. Run the focused test and confirm any missing guard fails.
- [ ] Implement matrix CI and document what the foundation gate proves. Do not add a workflow that publishes partially adapted defaults. Preserve the existing release workflow and npm publication issue as separate prerequisites.
- [ ] Mark Slice 1 checkboxes only after their commands pass. Record qualification evidence for the probe rule, not every rule included by a preset. Leave adaptation and release checkboxes unchecked.
- [ ] Write the next recovery/runtime batch allocation from audited helper dependencies: `no-catchall-generic-rethrow`, `no-early-catchall-null`, `no-run-effect-outside-boundary`, with listed transitive consumers, v3/v4 API variants, anti-pattern/clean pairs and exact diagnostics. This allocation is input to its own implementation plan, not authorisation to execute that slice.
- [ ] Run the complete gate: `bun run test`, `bun run typecheck`, `bun run build`, `bun run lint`, `bun run docs:api:check`, `bun run size`, `bun run pack:dry-run`, `bun run test:effect-versions`, `bun run test:type-aware`, then `git diff --check`. Investigate failures without reducing coverage or hiding bundle growth behind an unreviewed limit increase.
- [ ] Commit verified CI/docs/inventory changes: `ci: gate packed consumers for both Effect majors`.

## Completion Evidence

The handoff lists commits, exact commands and outcomes, qualified versus pending
inventory counts, and the next bounded batch. No 2.0 changeset, version bump,
push or release is part of this foundation plan. Final v4-first documentation,
full corpus migration and all-group qualification remain explicit roadmap work.

## Plan Self-Review

- Spec requirements retained as global constraints; later adaptation work is explicitly out of this foundation's completion claim.
- All five review-focus cases have owning test steps.
- Policy parsing and tuple types agree across tasks; one plugin registration is preserved.
- Release readiness is separate from baseline packed-consumer qualification.
- Task 1's audit evidence must drive the next batch; no unreviewed API rename is treated as semantic parity.
