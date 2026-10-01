# Wider Effect 4 Qualification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Preserve inline execution on main. Complete the approved campaign without asking for permission between verification batches; record progress and commit every verified batch.

**Goal:** Complete all applicable Effect 4 and legacy Effect 3 rule/group qualification, migration documentation and packaged skill evidence, ready for a separately authorised 2.0.0 release.

**Architecture:** Retain one plugin and explicit per-rule version policy. Extend the existing packed-major harness with a structured case manifest covering every applicable rule; qualify unchanged syntax just as rigorously as adapted syntax. Work group-by-group in up-to-three-rule commits, preserving the four existing scoped qualifications and recording unsupported APIs as evidenced applicability decisions, never silent successes.

**Tech Stack:** TypeScript, Bun, Oxlint/@oxlint/plugins 1.71.0, Effect 3.21.4 and 4.0.0, tsdown, publint, TypeDoc, Changesets.

**Spec:** [Approved migration design](../specs/2026-10-01-effect4-first-class-design.md). Baseline: `e8f93de`; [remaining allocation](../../../roadmap/14-effect4-compatibility/completion-batches.json).

## Global Constraints

- Plugin name, package specifier and stable rule IDs remain `linteffect` and `@opsydyn/oxlint-effect`.
- Version-sensitive rules accept a validated `effectVersion: 3 | 4` option, defaulting to 4 when manually enabled without options.
- Do not detect an Effect version by reading node_modules, a lockfile or a package manifest during rule execution.
- Do not ship an Effect runtime dependency inside the plugin.
- `typeAware` remains opt-in for both majors and does not enable compiler diagnostics or convert syntax rules into custom typed rules.
- Do not publish an intermediate v4 default while major groups remain unaudited.
- Preserve v3 diagnostics and contracts except separately evidenced corrections; do not warn on removed spelling under v4 merely as a migration diagnostic.
- Keep the 27 KB built-package cap; exceeding it requires an explicit reviewed optimisation or separate budget decision, not raising the number.
- Annotated bad code stays bad. No warning suppression or fabricated type casts to make fixtures compile.
- No push, PR, npm publish or credential changes in this campaign. Prepare a major changeset; applying it and publishing remain separate actions.

## Baseline And Completion

There are 146 registered rules. Four have scoped packed qualification for both
majors. Remaining work is 137 pending v4 rules and five currently v3-only rules;
v3 has 142 baseline entries awaiting packed qualification. The 142 work items
are allocated once in 52 batches across 17 primary groups. `ddd` is composite
and is qualified through its 21 members plus composition/config tests, not a
duplicate set of implementations.

Completion requires no applicable `pending` or `baseline` rule entries, every
exported group classified and qualified, major-correct repairs/examples, all
gates passing and no unexplained warning losses. Source audit may discover
additional legacy-only APIs or wrongly neutral rules: update classification,
runtime projection, preset membership and tests together with evidence.
Do not decrease scope by relabelling a difficult applicable rule not-applicable.

Stored runner/import aliases and computed properties remain outside the already
documented syntax scope. Full qualification means coverage of supported variants,
not whole-program inference. Test-shape `runPromiseWith` recognition is in scope
now because it belongs to the pending testing rules.

## Review Focus

1. Shared recovery/fork/service tables leaking version policy or assuming API renames imply semantic equivalence: own-major and opposite-policy parsed fixtures in each affected batch.
2. Context.Service class/function definitions, explicit Layer provision and method extraction: actual typechecked service definitions and legitimate composition controls in Q12-Q15/Q28-Q29.
3. Interruption, scope closure, race losers and permit ownership: runtime contract checks with deterministic bounded coordination in Q16-Q24; no hangs or timing-threshold assertions.
4. Invalid Schema/Option/Result/Predicate repairs, cause loss, time units and optional fields: compile-time and runtime contract pairs in Q01-Q03/Q26/Q30-Q36.
5. Atom/React package compatibility and packaged skill guidance assumed from export names: pinned ecosystem manifests, valid TSX fixtures and tarball asset checks in Q49-Q52 and Task 3.

## Files And Interfaces

Keep detectors in `src/index.ts` and policy projections in
`src/effect-version.ts`; do not undertake an unrelated module split.

Create `scripts/effect-version-qualification.ts` and
`tests/effect-version-qualification.test.ts` for case validation, independent
of process execution. Modify `scripts/verify-effect-version-consumers.ts` to
run validated cases in its existing temporary packed installation.

Each major consumer gets `qualification-cases.json`,
`oxlint.qualification.config.ts`, and
`src/qualification/<group>/<rule-id>.bad.ts` / `<rule-id>.good.ts`.
Use `.tsx` for React cases. Per-group semantic checks live in
`src/qualification/<group>/contracts.ts`; compile-negative controls use
`<rule-id>.types.ts` with checked `@ts-expect-error`, never in lint bad fixtures.
Update consumer manifests/lockfiles/tsconfigs only for audited dependencies.

Manifest case interface:

```ts
type QualificationCase = {
  rule: string;
  version: 3 | 4;
  classification: "unchanged" | "adapted" | "legacy-only";
  variants: string[];
  bad: string[];
  good: string[];
  expectedByFile: Record<string, Record<string, number>>;
  runtime?: string;
};
```

Produces:
`validateQualificationCases(cases: unknown, version: 3 | 4, registeredRules: readonly string[]): QualificationCase[]`
and
`assertQualificationCoverage(cases: readonly QualificationCase[], inventory: Record<string, unknown>, version: 3 | 4): void`.

Validation rejects unknown/duplicate rule cases, wrong version/classification, empty variants,
empty bad/good lists, nonpositive counts, unrelated diagnostic IDs, expectations
outside bad files, and bad/good overlap. One manifest case per rule/major can
contain multiple fixture files/variants. Do not derive expectations from lint
output. Check safe consumer-relative paths at execution and existence before
lint/typecheck; reject absolute paths, traversal and paths outside the copied
consumer. Runtime entries must be typed control scripts, not bad fixtures.

Coverage requires a case for every applicable qualified rule in partial runs;
a final complete run also requires every applicable registered rule qualified.
Legacy-only rules require a v3 case and explicit v4 exclusion evidence.
Preserve the exact-registration inventory gate; manifests are evidence, not a
second independently editable list of registered rules.

## Task 1: Fail-Closed Qualification Cases

**Files:** the two new helper/test files above; packed verifier;
`scripts/effect-version-consumer.ts`, `tests/effect-version-consumer.test.ts`;
both major consumer manifests/configs; `tests/effect-version.test.ts`;
`tests/effect-version-release.test.ts`.

- [x] Write tests `qualification rejects incomplete or fabricated evidence` and `qualification covers every applicable qualified rule`. Assert unknown/duplicate/wrong-major cases reject; missing clean control, empty variants, zero/negative count, another rule ID, unsafe/missing paths and qualified-without-case reject.
- [x] Run `bun test tests/effect-version-qualification.test.ts`; observe the expected missing validation implementation, then implement the stated interfaces and run GREEN.
- [x] Migrate the four already qualified rules' existing evidence into each manifest without changing detectors or dropping recovery/mixed-boundary probes. Keep baseline/probe files where useful; do not duplicate installation code.
- [x] Add `--require-complete` to the packed verifier, composed with existing `--effect-version 3|4`. Partial mode verifies completed cases; complete mode rejects any applicable missing/unqualified row. Add CLI tests and verify complete mode fails on this baseline inventory before further qualification.
- [x] Extend the existing copied-consumer verifier to typecheck all fixtures, execute each isolated rule case with literal per-file counts, lint all case clean files with that rule only, and run typed runtime control scripts. Keep mixed policies in one Oxlint process and verify clean files have zero diagnostics.
- [x] Run `bun run test`, `bun run typecheck`, `bun run test:effect-versions` and `bun run test:type-aware`; commit `test: establish exhaustive Effect qualification cases`.

## Task 2: Group-By-Group Rule Qualification

The table below defines every batch's exact rule ownership. No rule is skipped
because its current sensitivity is false. Treat each Q batch as one independently
verified task and commit; leave checkboxes open until evidence exists.

For every row, use this same ordered TDD contract:

- [ ] Audit the row's rules/helpers and diagnostic repairs against each pinned major's installed source/declarations. Record supported spellings, calling forms, negative variants and any applicability/sensitivity corrections in that row's manifest/inventory evidence before relying on them.
- [ ] Add parsed CLI fixtures plus focused tests in `tests/plugin.test.ts` under `Effect qualification Qxx`. Bad variants must have literal expected counts and report locations; good controls exercise the advised repair and closest legitimate lookalike. Include direct/data-last/piped/block variants only where the installed API supports them. For unchanged rules, the evidence test may go RED on missing manifest coverage rather than inventing a behaviour change.
- [ ] Run `bun test tests/plugin.test.ts --test-name-pattern 'Effect qualification Qxx'` and the relevant case-validation tests; record RED on the actual gap before changing detectors or evidence. Do not claim a passing pre-existing detector needed a fix.
- [ ] Implement only that row's missing recognition/repair contract in `src/index.ts`, threading explicit policy through changed shared helpers. Update `src/effect-version.ts` and schema/preset tests if sensitivity or legacy-only membership changes. Add regressions for every transitive helper owner, not automatic qualification for those owners.
- [ ] Add the row's annotated bad/good/type/runtime fixtures in both consumer group folders. Legacy-only fixtures live only in v3; v4 presets/manual-policy applicability controls prove the documented exclusion. Assertions use Exit/Cause/Option/Result APIs from that installed major and preserve identity, cause, units and wire formats.
- [ ] Run `bun run test`, `bun run typecheck`, `bun run test:effect-versions`, `bun run build`, `bun run size` and `git diff --check`. Expected: passing suite/types, actual packed diagnostics and clean controls, built size under the user-approved 30 KB dual-major budget (increased from 27 KB on 2026-10-01). Update README rows, inventory evidence, group status and this row only after these gates pass.
- [ ] Commit `test: qualify Effect versions Qxx <group>` (use `feat:` or `fix:` if it changes behaviour), then continue to the next row without an approval prompt.

### Batch-Specific Contracts

- **Q01-Q03:** preserve public structured errors, expected absence, source causes and empty-tag policy. Audit log-only recovery independently for plain/Cause/defect/filter/reason/eager variants; recognise only semantically applicable callbacks. Do not copy catchAll advice into v4.
- **Q04-Q09:** inspect every async/error callback combinator, swallowed recovery and nested Effect/gen boundary. Keep non-Effect JS callbacks clean. Qualify `no-effect-async` as legacy-only, including omission from all v4 maps.
- **Q10-Q11:** audit behaviorDecorationOperators and pillar classification against current v4 recovery/composition operators. Retry/timeout/span decoration remains behaviour, not business workflow; legitimate data transforms remain clean.
- **Q12-Q15:** Context.Service class and function forms, make-based construction, explicit layer/service retrieval and scoped provision; retain valid Layer.provide composition. V3 accessors/dependencies rules remain v3-only. Include method-returning-Effect versus Promise and default/override service-layer controls.
- **Q16-Q21:** forkChild/forkDetach/forkScoped, observation and observation aliases supported by existing syntax; explicit scoped/background ownership, interruptibility, bounded options, queues/pubsub, Ref/Deferred and semaphore contracts. Return/observe/interrupt clean controls must typecheck and use actual ownership APIs. Prove interrupted resource-owning children release and race losers are cleaned up with bounded runtime contracts, not string-name substitutions.
- **Q22-Q24:** acquisition/release, Scope, resources escaping scopes, request/global lifetime, held-resource execution and contextual provision. With context does not prove completeness. Include resource finalisation on success/failure/interruption and no double release.
- **Q25-Q27:** complete runner-owner qualification rather than relying on synthetic regressions; audit v4 recovery within boundary catches and valid JSON Schema decoding. Maintain conservative replacement paths and per-file isolation; test equivalent Node import/require and environment/config shapes.
- **Q28-Q29:** service tracing and structured logs; test/spec names and effect.flip semantics; direct and immediate runPromiseWith test execution, async ownership and default/mock test layers. Factory creation alone is clean. Repaired failure tests assert error identity/value, not accidental successes.
- **Q30-Q33:** all 11 domain contracts plus the 10 errorModeling members give 21 DDD contracts. Audit Schema brands, constructors, optionality, timestamps and tagged errors; include root advice/type/runtime wire-format repairs. Preserve domain semantic policy, not merely API spelling.
- **Q34-Q36:** Option, Match, Result/Either, Predicate and boolean/sentinel normalisation. Qualify no-fromnullable-nullish-coalesce only for v3. Validate any Schema/Predicate repair before recommending it in v4.
- **Q37-Q44:** actual flow/pipe/gen forms and depth/count thresholds; preserve clean named composition and distinguish pure transformations from workflows and decoration. Qualify no-effect-orElse-ladder only for v3.
- **Q45-Q48:** parser-only rules still require typed examples and exact packed warnings in both majors. Test nearest legitimate callbacks/objects/functions at threshold boundaries; do not change business policy to simplify examples.
- **Q49-Q52:** audit Runtime/ManagedRuntime/platform exports before assuming version neutrality. Pin a genuinely Effect-4-compatible React/atom package or establish supported v4 applicability from primary evidence. Missing ecosystem compatibility is a recorded blocker, not fake clean qualification or a cast. React state/render controls and state-update repairs must compile as TSX and preserve behaviour.

### Allocation Checklist

| Complete | Batch | Group | Rules |
| --- | --- | --- | --- |
| [x] | Q01 | `errorModeling` | `no-error-as-public-effect-error`, `no-unknown-public-error-channel`, `no-mixed-effect-error-shapes` |
| [x] | Q02 | `errorModeling` | `no-expected-state-as-error`, `no-empty-error-tag`, `no-exception-domain-error` |
| [x] | Q03 | `errorModeling` | `no-log-only-error-handling` |
| [x] | Q04 | `effectComposition` | `no-effect-as`, `no-effect-do`, `no-effect-bind` |
| [x] | Q05 | `effectComposition` | `no-effect-async`, `no-effect-ignore`, `no-effect-never` |
| [x] | Q06 | `effectComposition` | `no-effect-fn-generator`, `no-nested-effect-gen`, `no-yield-without-star-in-effect-gen` |
| [x] | Q07 | `effectComposition` | `no-async-effect-combinator-callback`, `no-throw-in-effect-logic`, `no-try-catch-in-effect-logic` |
| [x] | Q08 | `effectComposition` | `no-promise-api-in-effect-logic`, `no-swallowed-catch-all`, `no-manual-effect-channels` |
| [x] | Q09 | `effectComposition` | `no-effect-type-alias`, `no-public-generic-effect-error` |
| [x] | Q10 | `behaviorDecoration` | `prefer-pipe-for-behavior`, `prefer-decorated-effect-before-gen`, `no-workflow-in-behavior-pipe` |
| [ ] | Q11 | `styleSeparation` | `no-mixed-pillar-function`, `no-clever-effect-expression`, `prefer-extracted-concept` |
| [ ] | Q12 | `serviceAndLayerArchitecture` | `prefer-effect-service`, `no-layer-provide-in-service-definition`, `require-service-accessors` |
| [ ] | Q13 | `serviceAndLayerArchitecture` | `require-service-dependencies`, `no-namespace-effect-import`, `no-manual-service-object-export` |
| [ ] | Q14 | `serviceAndLayerArchitecture` | `no-layer-merge-in-request-handler`, `no-service-method-returning-promise`, `prefer-layer-pipe` |
| [ ] | Q15 | `serviceAndLayerArchitecture` | `no-inline-layer-provide-in-program`, `prefer-layer-mergeall-for-infrastructure`, `no-service-layer-scatter` |
| [ ] | Q16 | `concurrencySafety` | `no-unbounded-effect-all`, `no-fire-and-forget-fork`, `no-fork-in-loop` |
| [ ] | Q17 | `concurrencySafety` | `no-race-without-cleanup`, `no-unobserved-fiber`, `no-unbounded-concurrent-retry` |
| [ ] | Q18 | `concurrencySafety` | `no-blocking-call-in-effect`, `no-promise-concurrency-in-effect`, `no-shared-mutable-state-across-fibers` |
| [ ] | Q19 | `concurrencySafety` | `no-timeout-with-noninterruptible-promise`, `no-uninterruptible-concurrent-region`, `no-unbounded-queue-or-pubsub` |
| [ ] | Q20 | `concurrencySafety` | `no-global-mutable-concurrency-state`, `no-manual-deferred-coordination`, `no-yield-with-held-semaphore-permit` |
| [ ] | Q21 | `concurrencySafety` | `no-yield-with-held-mutable-ref`, `no-unscoped-background-fiber`, `no-acquire-without-scoped-release` |
| [ ] | Q22 | `resourceLifetime` | `no-manual-resource-close`, `no-unbound-scope`, `no-resource-succeed-escape` |
| [ ] | Q23 | `resourceLifetime` | `no-resource-without-acquire-release`, `no-request-scoped-long-lived-resource`, `no-global-resource-singleton` |
| [ ] | Q24 | `resourceLifetime` | `no-nested-acquire-release`, `no-missing-layer-provision-at-run`, `no-run-with-open-resource` |
| [ ] | Q25 | `platformAndBoundaryHygiene` | `no-hidden-effect-execution`, `no-boundary-try-catch-without-effect-map`, `no-node-fs-in-effect-code` |
| [ ] | Q26 | `platformAndBoundaryHygiene` | `no-json-parse-without-schema`, `no-date-now-in-effect`, `no-node-platform-in-shared-code` |
| [ ] | Q27 | `platformAndBoundaryHygiene` | `no-process-env-direct-read` |
| [ ] | Q28 | `testingObservabilityAndQa` | `no-console-in-effect-flow`, `no-effect-log-without-structured-context`, `require-span-on-public-service-method` |
| [ ] | Q29 | `testingObservabilityAndQa` | `no-runpromise-in-non-async-test-body`, `require-effect-flip-for-error-test`, `no-test-mock-layer-when-default-available` |
| [ ] | Q30 | `domainModeling` | `no-raw-domain-id-alias`, `no-boolean-domain-flag`, `no-magic-domain-string` |
| [ ] | Q31 | `domainModeling` | `no-raw-domain-primitive-params`, `no-raw-time-domain-field`, `no-overloaded-options-object` |
| [ ] | Q32 | `domainModeling` | `no-domain-logic-in-conditional`, `no-implicit-state-machine-object`, `no-adhoc-domain-error` |
| [ ] | Q33 | `domainModeling` | `no-domain-meaning-by-folder-only`, `no-new-date-in-domain-logic` |
| [ ] | Q34 | `optionMatchAndDataNormalization` | `no-option-as`, `no-match-void-branch`, `no-match-effect-branch` |
| [ ] | Q35 | `optionMatchAndDataNormalization` | `no-model-overlay-cast`, `no-unknown-boolean-coercion-helper`, `no-fromnullable-nullish-coalesce` |
| [ ] | Q36 | `optionMatchAndDataNormalization` | `no-option-boolean-normalization`, `no-string-sentinel-return`, `no-string-sentinel-const` |
| [ ] | Q37 | `effectFlow` | `no-piped-yield-in-gen`, `no-gen-for-mapping`, `prefer-gen-for-workflow` |
| [ ] | Q38 | `effectFlow` | `no-business-logic-in-pipe` |
| [ ] | Q39 | `pureTransformation` | `no-large-anonymous-flow`, `no-effect-in-flow`, `prefer-named-flow` |
| [ ] | Q40 | `pureTransformation` | `prefer-flow-for-pure-pipeline` |
| [ ] | Q41 | `pipelineShapeAndSequencing` | `no-nested-effect-call`, `no-effect-ladder`, `no-flatmap-ladder` |
| [ ] | Q42 | `pipelineShapeAndSequencing` | `no-pipe-ladder`, `no-call-tower`, `no-effect-orElse-ladder` |
| [ ] | Q43 | `pipelineShapeAndSequencing` | `no-effect-wrapper-alias`, `warn-effect-sync-wrapper`, `no-effect-side-effect-wrapper` |
| [ ] | Q44 | `pipelineShapeAndSequencing` | `no-effect-all-step-sequencing`, `no-effect-succeed-variable` |
| [ ] | Q45 | `branchingAndLocalControlFlow` | `no-if-statement`, `no-switch-statement`, `no-ternary` |
| [ ] | Q46 | `branchingAndLocalControlFlow` | `no-try-catch`, `no-arrow-ladder`, `no-iife-wrapper` |
| [ ] | Q47 | `branchingAndLocalControlFlow` | `no-return-in-arrow`, `no-return-in-callback`, `no-return-null` |
| [ ] | Q48 | `branchingAndLocalControlFlow` | `no-branch-in-object` |
| [ ] | Q49 | `reactAndRuntimeBoundaries` | `no-react-state`, `no-runtime-runfork`, `no-or-die-outside-boundary` |
| [ ] | Q50 | `reactAndRuntimeBoundaries` | `prevent-dynamic-imports`, `no-render-side-effects`, `no-inline-runtime-provide` |
| [ ] | Q51 | `atomStateAndPlatformBoundaries` | `no-effect-sync-console`, `no-atom-registry-effect-sync`, `no-family-collection-read` |
| [ ] | Q52 | `atomStateAndPlatformBoundaries` | `no-naked-object-state-update`, `no-wrapgraphql-catchall` |

## Task 3: Primary Examples, Skill And Group Composition

**Files:** `README.md`; `skills/oxlint-effect/SKILL.md`, all its existing
`references/*.md` and `assets/*.ts`; `tests/agent-skill.test.ts`;
`tests/rule-qa.test.ts`; both consumers' `src/config-contract.ts`;
`docs/effect-version-inventory.json`; create
`docs/effect-version-groups.json` and
`docs/superpowers/reports/2026-10-01-effect4-complete-qualification.md`.

- [ ] Add RED tests requiring every exported group/preset and rules-only companion in both packed config contracts, plus DDD's exact 21-member union. Prove default/manual v4, legacy namespace, strict/recommended exclusions, boundary/config option retention and same-process mixed majors.
- [ ] Write version-correct guidance for every rule repair; make the pinned Effect 4 consumer and its group index the primary examples. Retain labelled v3 reference app/assets; link each bad control to its rule and repair. Do not claim an application runtime was launched: this is lint/type/runtime-contract QA.
- [ ] Package v4-first skill assets under `skills/oxlint-effect/assets/effect4/` and retain legacy assets under their existing names with explicit labels. Update skill guidance to select the installed major and consumer config, not prescribe v3 API options universally. Typecheck assets against each matching pinned consumer in the packed harness.
- [ ] Populate group evidence from completed rule cases: unchanged/adapted/legacy-only classification plus member applicability and scope. Group qualification is conjunctive over every applicable member and config-composition tests, not the fraction that warns.
- [ ] Run `bun run test`, both packed majors, packed type-aware gate, TypeDoc and relative-link checks; inspect tarball skill assets and commit `docs: complete versioned Effect guidance and group evidence`.

## Task 4: Closure Review And Release Preparation

**Files:** final qualification report, compatibility roadmap, design status,
`scripts/effect-version-release.ts`, `scripts/verify-effect-version-release.ts`,
`tests/effect-version-release.test.ts`, `.changeset/effect4-first-class.md`.
No manual version bump here.

**Interface:** add `assertEffectGroupReleaseReady(groups: unknown, exportedGroupNames: readonly string[]): void` alongside the existing rule guard. Reject missing/extra groups, any unqualified applicable member or absent config/skill evidence. The release verifier invokes both guards; preserve the current rule guard's three-argument signature.

- [ ] Run `bun scripts/verify-effect-version-consumers.ts --require-complete` after a fresh build; expect all applicable rule/major cases and group composition pass, no missing evidence.
- [ ] Extend release tests to require qualified groups and packaged skill evidence as well as exact rule coverage; observe RED before wiring new checks. Evaluate the reviewed prospective version `2.0.0`; keep the real 1.2.0 release command blocked until the version changeset is applied.
- [ ] Run `bun run test`, `bun run typecheck`, `bun run test:effect-versions`, `bun run test:type-aware`, `bun run build`, `bun run lint`, `bun run docs:api:check`, `bun run size`, `bun run pack:dry-run`, `git diff --check`. Record exact results and any unqualified variant, never extrapolate.
- [ ] Obtain one fresh whole-campaign review. Address verified important findings with RED/GREEN regressions and the full gates, record rulings/minor findings and retain explicit syntax limits. Do not substitute reviewer probes for persistent required regressions.
- [ ] Write major changeset and migration notes: default v4, effect3 legacy namespace, applicability changes, corrected runner boundaries and all group/skill evidence. Mark the roadmap complete only if every required gate passes; a missing compatible ecosystem dependency leaves its group and campaign incomplete.
- [ ] Commit `docs: prepare qualified Effect 4 major release`. Leave main clean. Report code qualification separately from publication, remote CI, npm access and version application.

## Self-Review

The frozen allocation covers all 142 baseline work items exactly once and
retains the four completed rules as existing evidence, not repeated detector
work. Tasks 1-4 cover every section of the approved spec, with five concrete
risk classes assigned to their batches. There are no publication actions.
This is a closure campaign, not a claim that all 52 batches need code changes
or that all currently neutral/API-dependent classifications are correct.
