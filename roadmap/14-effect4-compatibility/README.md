# 14 Effect 4 First-Class Compatibility

Status: foundation, recovery/runtime batch and Q01-Q16 locally verified; Q17-Q52 and cross-group closure remain outstanding.

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
97 rules still have an unqualified applicable version. Presets accepting
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
