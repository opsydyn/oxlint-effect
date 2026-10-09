# 14 Effect 4 First-Class Compatibility

Status: all 52 batches, 146 registered rules and 18 groups qualified; fresh review completed and findings fixed. Version 2.0.0 was published and verified on npm and GitHub on 2026-10-08.

Current gate (2026-10-03): 586 tests / 5418 expectations, both packed majors in
complete mode, types, packed typeAware, publint, API docs, package inspection
and size pass. Build is 29,860 compressed bytes under the unchanged 30,000-byte
cap. All applicable rule/group statuses qualify; five policies remain legacy-only.
Publication: [npm](https://www.npmjs.com/package/@opsydyn/oxlint-effect) and
[GitHub 2.0.0](https://github.com/opsydyn/oxlint-effect/releases/tag/v2.0.0).
The batch notes below retain historical
measurements and pending statuses; this current gate supersedes those snapshots.

## Historical Batch Snapshots

Q22 cleanup/manual-scope/resource-success behavioural checks and examples pass
for both majors, but final qualification is blocked by the 30 KB size cap
(123 bytes over). Its completion checkbox and inventory statuses remain open.

Q23 acquisition/request/global behavioural checks also pass; its build is 208
bytes over the unchanged cap. Release waits for Q52 and campaign closure.

Q24 nesting/provision/runner behavioural checks pass, including valid-context
and lexical-order counterexamples. Its build is 330 bytes over the cap;
qualification remains open. Continue Q25-Q52 before release.

Q25 hidden execution/boundary recovery/filesystem behavioural checks pass.
Current recovery selects current APIs; v3 messages remain unchanged. Size is
398 bytes over the cap; final qualification stays open. Continue Q26-Q52.

Q26 decoding/clock/platform behavioural checks pass; current clock policy and
schema advice use pinned v4 APIs. Size is 385 bytes over the unchanged cap;
qualification remains open. Continue Q27-Q52.

Q27 environment/config behavioural checks pass with unchanged detection and
own-major typed provider repairs. Size remains 385 bytes over the cap;
final qualification stays open. Continue Q28-Q52.

Q28 observability behavioural checks pass for current service/recovery forms,
actual logger context and once-only span closure. Size is 600 bytes over the
unchanged cap; final qualification stays open. Continue Q29-Q52.

Q29 test ownership/failure/default-layer behavioural checks pass, including real
Bun execution and typed failure identity. Size is 649 bytes over the unchanged
cap; final qualification stays open. Continue Q30-Q52.

Q30 branded identity/explicit commands/status vocabulary behavioural checks
pass with unchanged detectors. Size remains 649 bytes over the cap; final
qualification stays open. Continue Q31-Q52.

Q31 commands/time/options behavioural checks pass with validated wire units
and compiler controls. Size remains 649 bytes over the cap; final qualification
stays open. Continue Q32-Q52.

Q32 eligibility/lifecycle/error behavioural checks pass with unchanged syntax
policy and real Predicate/Schema/Match/Data repairs. Size remains 649 bytes over
the cap; final qualification stays open. Continue Q33-Q52.

Q33 context/clock behavioural checks pass, completing evidence for the 11 domain
owners. Size remains 649 bytes over the cap; final qualification stays open.
Continue Q34-Q52.

Q34 Option/Match behavioural checks pass, preserving presence and branch values
with explicit unsafe-rewrite counterexamples. Size remains 649 bytes over the
cap; final qualification stays open. Continue Q35-Q52.

Q35 decoded-model/nullish checks pass; current const false positive corrected
and fromNullishOr restores current applicability under the stable rule ID.
Four owners remain legacy-only. Size is 677 bytes over the unchanged cap;
final qualification stays open. Continue Q36-Q52.

Q36 boolean/outcome checks pass, completing all nine normalisation owners with
current Result/legacy Either guidance. Size is 696 bytes over the unchanged
cap; final qualification stays open. Continue Q37-Q52.

Q37 workflow checks pass with current eager/legacy zipRight policy, mapping
and event/failure contracts. Size is 752 bytes over the unchanged cap;
final qualification stays open. Continue Q38-Q52.

Q38 business callbacks pass current eager and own-major service controls,
completing workflow behavioural evidence. Size is745 bytes over the unchanged
cap; final qualification stays open. Continue Q39-Q52.

Q39 pure-flow checks pass with actual flow/runtime and conservative-name controls.
Size remains745 bytes over the unchanged cap; qualification stays open. ContinueQ40-Q52.

Q40 call-tower checks pass, completing pure-transformation behavioural evidence.
Size remains745 bytes over the unchanged cap; qualification stays open. ContinueQ41-Q52.

Q41 ladder checks pass with current eager/mixed flatMap forms, generator repairs
and sequencing/failure contracts. Size is 769 bytes over the unchanged cap;
qualification stays open. Continue Q42-Q52 and campaign closure.

Q42 nested-pipe/direct-tower and terminal recovery checks pass. Manual current
configuration now skips the legacy-only orElse detector. Size is 771 bytes over
the unchanged cap; qualification stays open. Continue Q43-Q52 and closure.

Q43 wrapper checks pass with current andThen/legacy zipRight and actual deferred
execution/defect identity controls. Size is 800 bytes over the unchanged cap;
qualification stays open. Continue Q44-Q52 and closure.

Q44 collection/value checks pass, finishing all 11 pipeline owners' behavioural
evidence. Current Ref.set runtime output is preserved despite its void type.
Size stays 800 bytes over the cap; qualification remains open. Continue Q45-Q52.

Q45 branching checks pass with current Result/legacy Either advice and actual
branch-preserving Match repairs. Size is 829 bytes over the unchanged cap;
qualification stays open. Continue Q46-Q52 and closure.

Q46 exception/IIFE checks pass with cleanup, original failure identity and
deferred Promise execution controls. Size remains 829 bytes over the unchanged
cap; qualification stays open. Continue Q47-Q52 and closure.

Q47 callback/absence checks pass with current makeFilter/legacy filter exemption,
actual decoding and Option wire controls. Size is 861 bytes over the unchanged
cap; qualification stays open. Continue Q48-Q52 and closure.

Q48 object-value checks pass with current Result/legacy Either and actual
context/absence/error controls, completing all ten branching owners. Size is
879 bytes over the cap; qualification stays open. Continue Q49-Q52 and closure.

Q49 real React SSR and runtime/error checks pass. Runtime.runFork is legacy-only;
current policy ignores removed orDieWith and avoids unqualified legacy adapter
advice. Size is 977 bytes over the cap; qualification stays open. Continue Q50-Q52.

Q50 loading, rendering and provision checks pass with real SSR and typed service
ownership controls. Conservative detector limits are documented. Size is 944
bytes over the cap; qualification stays open. Continue Q51-Q52 and closure.

Q51 real native/current and separately pinned legacy atom/logging checks pass.
Mounted lifetime and nested-effect execution limits are explicit. Size remains
944 bytes over the cap; qualification stays open. Continue Q52 and closure.

Q52 state/envelope checks pass with current broad/eager recovery recognition and
valid own-major schema repairs. All 52 batches have behavioural evidence; formal
qualification remains open. Size is 1,004 bytes over the cap; Tasks 3/4 remain.

Task 3 group/preset, rules-only, exact DDD and packaged current/legacy skill
contracts pass, including type-aware opt-in and resolvable QA indexes. Group
inventory is present but pending alongside member qualification. Task 4 remains:
unchanged size cap, group release guard, whole-campaign review and final gates.

## Policy And Scope

Effect 4 is the default target for published plugin `2.0.0`. Legacy users
select `effect3` presets. Existing rule IDs and plugin registration remain stable.
See the [design](../../docs/superpowers/specs/2026-10-01-effect4-first-class-design.md).
Start with the [foundation implementation plan](../../docs/superpowers/plans/2026-10-01-effect4-compatibility-foundation.md).

This is compatibility work on existing rules, not an addition to the original
100-candidate rule count. Checkboxes record verified implementation, not approval
or design completion.

## Slice 1: Version Contract And Consumer Gates

- [x] Add default-v4 policy and complete `effect3` preset/rules namespace.
- [x] Validate per-rule `effectVersion` with existing option composition.
- [x] Add isolated, pinned v3/v4 packed consumers and CI gates.
- [x] Establish a version audit inventory for every rule and group.
- [x] Test mixed-major overrides and manual-rule configuration.

Qualification scope: `no-effect-fail-error-message` has pinned packed failure
and clean controls for both majors. The mixed-major boundary probe proves
configuration isolation with common runner syntax, not all v4 runner variants.
All 146 registered rules now have scoped qualification for every applicable
major. Presets accepting `effectVersion` alone do not prove adaptation; their
documented failures, controls and contracts are covered in the complete matrix.
The rule/group release guard passes at 2.0.0 after the qualified major bump.
See the [foundation qualification report](../../docs/superpowers/reports/2026-10-01-effect4-foundation-qualification.md)
for local evidence, review fixes and limits.

## Slice 2: Recovery And Runtime Boundaries

- [x] Audit recovery operators and support v4 names where semantics match.
- [x] Cover v4 runner APIs, including supported `run*With` variants.
- [x] Update boundary, callback, logging and recovery detection transitively.
- [x] Add annotated failures, clean controls and exact diagnostic assertions.

First targeted batch: `no-catchall-generic-rethrow`, `no-early-catchall-null`,
`no-run-effect-outside-boundary`. Shared-helper consumers need regression coverage
even when they are not the three headline rules.
See the [completed batch allocation](./recovery-runtime-batch.md) and
[qualification report](../../docs/superpowers/reports/2026-10-01-effect4-recovery-runtime-qualification.md).

The [wider qualification completion plan](../../docs/superpowers/plans/2026-10-01-effect4-complete-qualification.md)
allocates the remaining 142 rule work items into 52 group-owned batches of at
most three. Its [machine-readable allocation](./completion-batches.json) records
the baseline, not completed qualification. The plan is approved and its
fail-closed qualification harness is implemented; wider rule batches advance
only after their packed warning and clean-control gates pass.

- [x] Qualify plain recovery for `no-catchall-generic-rethrow` and `no-early-catchall-null` across majors.
- [x] Qualify ordinary and immediate context-aware runners for `no-run-effect-outside-boundary`.
- [x] Repair runner boundary options and add transitive runner regressions.
- [x] Add typed packed failures, clean controls, runtime contracts and documentation for this batch.

Slice 2's allocated logging/recovery, callback and runtime owners and group
composition are now qualified. Stored runner aliases remain documented syntax
limits; supported testing-group `runPromiseWith` forms have their own packed cases.

## Slice 3: Concurrency Safety

- [x] Cover `forkChild` and `forkDetach` with actual lifecycle semantics.
- [x] Audit fiber observation, mutable state and concurrency options.
- [x] Audit queues/pubsub, permits and Deferred API changes.
- [x] Qualify scoped and owned clean variants for both majors.

First targeted batch: `no-fire-and-forget-fork`, `no-fork-in-loop`,
`no-unobserved-fiber`. Detached-fiber ownership follows as a separate batch.

Q16-Q21's allocated rule batches now have packed failures, clean controls and
runtime/type contracts for both majors. Final group/preset composition closure
now passes; publication and remote CI remain separate gates.

## Slice 4: Service And Layer Architecture

- [x] Support Context.Service definitions, make effects and explicit layers.
- [x] Keep removed accessor/dependency-option rules legacy-only.
- [x] Audit provision, method return, tracing and test-layer detection.
- [x] Document version-applicable rules and replacements without invalid advice.

First targeted batch: `prefer-effect-service`, `require-service-accessors`,
`require-service-dependencies`. Legacy-only classification is intentional,
not a detector pretending to enforce nonexistent v4 options.

## Slice 5: Resource, Platform And Remaining Groups

- [x] Audit all resource/lifetime and runtime interaction contracts.
- [x] Audit platform import organisation and Schema boundary detection.
- [x] Audit Effect flow, pure transformation and style groups.
- [x] Audit Option/Match/data normalisation and React atom integrations.
- [x] Close every group classification in the compatibility inventory.

Detailed batches follow the inventory; do not mark the complete surface ready
from the initial recovery/concurrency probes alone.

## Slice 6: Versioned Examples And Companion Skill

- [x] Make primary guidance and runnable/QA examples v4-first.
- [x] Retain separately labelled v3 examples and passing controls.
- [x] Port Schema, Predicate, Option and service examples semantically.
- [x] Validate all applicable DDD annotations and runtime/type contracts per major.
- [x] Verify skill packaging, links and version-correct repair advice.

Examples and docs ship with each preceding rule batch; this slice closes the
remaining cross-cutting corpus and guidance coverage rather than postponing QA.

## Slice 7: Major Release Qualification

- [x] Full v3/v4 matrix and normal repository gates pass.
- [x] Packed type-aware consumers pass with explicit opt-in preserved.
- [x] Audit inventory has no unexplained or unqualified applicable entries.
- [x] Document upgrade to v4 defaults and effect3 migration for legacy users.
- [x] Add reviewed major changeset and release notes for `2.0.0`.
- [x] Verify publishing access, push and confirm registry/GitHub publication (2026-10-08).

No Effect 4 compatibility claim or default-policy release precedes this gate.
