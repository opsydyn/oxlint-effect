# 14 Effect 4 First-Class Compatibility

Status: foundation, recovery/runtime batch and Q01-Q21 locally verified; Q22-Q52 and cross-group closure remain outstanding.

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

Effect 4 is the default target for the planned plugin `2.0.0`. Legacy users
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
The three headline recovery/runtime rules now also have scoped qualification;
82 rules still have an unqualified applicable version. Presets accepting
`effectVersion` does not imply that pending detectors already branch on it.
The release/prepublish guard blocks this checkout until a major bump and
all applicable major-specific qualifications are complete.
See the [foundation qualification report](../../docs/superpowers/reports/2026-10-01-effect4-foundation-qualification.md)
for local evidence, review fixes and limits.

## Slice 2: Recovery And Runtime Boundaries

- [ ] Audit recovery operators and support v4 names where semantics match.
- [ ] Cover v4 runner APIs, including supported `run*With` variants.
- [ ] Update boundary, callback, logging and recovery detection transitively.
- [ ] Add annotated failures, clean controls and exact diagnostic assertions.

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

Slice 2 remains open for full group closure. Q01-Q10 now qualify the allocated
logging/recovery, async callback and behaviour-decoration owners. This does not
qualify other consumers of their shared helpers.
Stored runner aliases and testing-group `runPromiseWith` shapes remain follow-on
coverage; neither is implied by the headline runner qualification.

## Slice 3: Concurrency Safety

- [ ] Cover `forkChild` and `forkDetach` with actual lifecycle semantics.
- [ ] Audit fiber observation, mutable state and concurrency options.
- [ ] Audit queues/pubsub, permits and Deferred API changes.
- [ ] Qualify scoped and owned clean variants for both majors.

First targeted batch: `no-fire-and-forget-fork`, `no-fork-in-loop`,
`no-unobserved-fiber`. Detached-fiber ownership follows as a separate batch.

Q16-Q21's allocated rule batches now have packed failures, clean controls and
runtime/type contracts for both majors. Final group/preset composition closure
is still a campaign-wide gate; this is not release readiness.

## Slice 4: Service And Layer Architecture

- [ ] Support Context.Service definitions, make effects and explicit layers.
- [ ] Keep removed accessor/dependency-option rules legacy-only.
- [ ] Audit provision, method return, tracing and test-layer detection.
- [ ] Document version-applicable rules and replacements without invalid advice.

First targeted batch: `prefer-effect-service`, `require-service-accessors`,
`require-service-dependencies`. Legacy-only classification is intentional,
not a detector pretending to enforce nonexistent v4 options.

## Slice 5: Resource, Platform And Remaining Groups

- [ ] Audit all resource/lifetime and runtime interaction contracts.
- [ ] Audit platform import organisation and Schema boundary detection.
- [ ] Audit Effect flow, pure transformation and style groups.
- [ ] Audit Option/Match/data normalisation and React atom integrations.
- [ ] Close every group classification in the compatibility inventory.

Detailed batches follow the inventory; do not mark the complete surface ready
from the initial recovery/concurrency probes alone.

## Slice 6: Versioned Examples And Companion Skill

- [ ] Make primary guidance and runnable/QA examples v4-first.
- [ ] Retain separately labelled v3 examples and passing controls.
- [ ] Port Schema, Predicate, Option and service examples semantically.
- [ ] Validate all applicable DDD annotations and runtime/type contracts per major.
- [ ] Verify skill packaging, links and version-correct repair advice.

Examples and docs ship with each preceding rule batch; this slice closes the
remaining cross-cutting corpus and guidance coverage rather than postponing QA.

## Slice 7: Major Release Qualification

- [ ] Full v3/v4 matrix and normal repository gates pass.
- [ ] Packed type-aware consumers pass with explicit opt-in preserved.
- [ ] Audit inventory has no unexplained or unqualified applicable entries.
- [ ] Document upgrade to v4 defaults and effect3 migration for legacy users.
- [ ] Add reviewed major changeset and release notes for `2.0.0`.
- [ ] Verify publishing access, push and confirm registry/GitHub publication.

No Effect 4 compatibility claim or default-policy release precedes this gate.
