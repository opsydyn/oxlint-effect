# Effect 4 Release Preparation

Target: **2.0.0**, staged by `.changeset/effect4-first-class.md`.
Status: **blocked; not ready to publish**. Package version remains 1.2.0 until
qualification is complete and the release PR is prepared. No tag, push or
publication is part of this preparation.

## Migration Notes

- Default exports select Effect 4 policy; this requires a major release.
- Effect 3 consumers select `effect3.recommended`, `effect3.ddd` or another
  corresponding legacy group. Spread `jsPlugins` when composing Oxlint config.
- Manual version-sensitive rule entries use `effectVersion: 3` for legacy policy
  or `effectVersion: 4` for current policy. Preserve this option alongside
  custom boundary paths.
- Rule IDs and the `linteffect` registration remain stable. Removed Effect 3
  APIs are legacy-only; type-aware configuration remains explicitly opt-in.

Configuration examples and limitations are in the [README](../../../README.md).

## Release Checklist

- [x] Stage a major changeset with migration notes.
- [x] Preserve the publication guard; apply the explicitly user-approved 30 KB
  dual-major budget on 2026-10-01 (previously 27 KB).
- [x] Resolve Q10 size failure and qualify its three rules: fresh build measures
  27.16 KB, within the approved 30 KB cap.
- [x] Qualify Q11 Style Separation, including failures, repairs and runtime controls.
- [x] Qualify Q12 service definitions, version-correct repairs and legacy accessor exclusion.
- [x] Qualify Q13 legacy dependencies, namespace imports and manual service exports.
- [x] Qualify Q14 handler layers, Promise-returning methods and provision piping.
- [x] Qualify Q15 workflow provisioning, infrastructure merges and scatter thresholds.
- [x] Qualify Q16 explicit collection scheduling and fork construction/loop ownership.
- [x] Qualify Q17 race cleanup, lexical fiber observation and retry scheduling.
- [x] Qualify Q18 async boundaries, Promise aggregation and lexical shared-state work.
- [x] Qualify Q19 timeout cancellation, masking boundaries and bounded buffers.
- [x] Qualify Q20 lexical global ownership, Deferred coordination and semaphore permits.
- [x] Qualify Q21 held refs, detached lifetime and concurrent acquisition ownership.
- [ ] Close Q22 cleanup/manual-scope/resource-success qualification: behavioural
  checks pass, but its 139.04 kB raw build exceeds the unchanged 30 KB compressed
  cap by 123 bytes. Inventory entries remain unqualified pending this gate.
- [ ] Close Q23 acquisition/request/global qualification: behavioural gates pass;
  current compressed size exceeds unchanged 30 KB by 208 bytes.
- [ ] Close Q24 nesting/provision/runner qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 330 bytes.
- [ ] Close Q25 hidden execution/boundary/filesystem qualification: behavioural
  gates pass; compressed size exceeds unchanged 30 KB by 398 bytes.
- [ ] Close Q26 decoding/clock/platform qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 385 bytes.
- [ ] Close Q27 environment/config qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 385 bytes.
- [ ] Close Q28 observability qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 600 bytes.
- [ ] Close Q29 test qualification: behavioural gates and real Bun tests pass;
  compressed size exceeds unchanged 30 KB by 649 bytes.
- [ ] Close Q30 domain vocabulary qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 649 bytes.
- [ ] Close Q31 command/time/options qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 649 bytes.
- [ ] Close Q32 lifecycle/error qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 649 bytes.
- [ ] Close Q33 context/clock qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 649 bytes.
- [ ] Close Q34 Option/Match qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 649 bytes.
- [ ] Close Q35 decoded-model/nullish qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 677 bytes.
- [ ] Close Q36 boolean/outcome qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 696 bytes.
- [ ] Close Q37 workflow qualification: behavioural gates pass;
  compressed size exceeds unchanged 30 KB by 752 bytes.
- [ ] Close Q38 business-workflow qualification: behavioural gates pass;
  compressed size exceeds unchanged30 KB by745 bytes.
- [ ] Close Q39 pure-flow qualification: behavioural gates pass;
  compressed size exceeds unchanged30 KB by745 bytes.
- [ ] Close Q40 call-tower qualification: behavioural gates pass;
  compressed size exceeds unchanged30 KB by745 bytes.
- [ ] Close Q41 ladder qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 769 bytes.
- [ ] Close Q42 pipe/tower/recovery qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 771 bytes.
- [ ] Close Q43 wrapper qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 800 bytes.
- [ ] Close Q44 collection/value qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 800 bytes.
- [ ] Close Q45 branching qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 829 bytes.
- [ ] Close Q46 exception/IIFE qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 829 bytes.
- [ ] Close Q47 callback/absence qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 861 bytes.
- [ ] Close Q48 object-value qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 879 bytes.
- [ ] Close Q49 React/runtime qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 977 bytes.
- [ ] Close Q50 loading/render/provision qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 944 bytes.
- [ ] Close Q51 atom/logging qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 944 bytes.
- [ ] Close Q52 state/envelope qualification: behavioural gates pass;
  compressed size exceeds the unchanged 30 KB cap by 1,004 bytes. All Q batches
  now have evidence in the [campaign plan](../plans/2026-10-01-effect4-complete-qualification.md).
  Current inventory has 82 rules with an unqualified applicable version.
- [ ] Complete all group/preset and packaged skill/documentation composition
  checks, including failures and repairs for both supported majors.
- [ ] Obtain the fresh whole-campaign review required by the approved plan.
- [ ] Pass the complete Effect version gate, unit tests, typecheck, packed
  consumers, type-aware consumer, publint, API docs, size and package inspection.
- [ ] Apply Changesets versioning, confirm 2.0.0 and generated changelog, then
  rerun the real publication guard against the resulting package version.
- [ ] Push only when authorised and release-ready; merge the generated release
  PR, then verify npm publication and GitHub release independently.

## Verification Commands

Fresh preparation checks passed: 480 unit tests, root typecheck, both packed
Effect consumer suites, the type-aware consumer, publint, API documentation
validation, dry-run package inspection and Changesets status. These are partial
qualification checks, not proof that the full campaign is complete. The initial
size check failed by 156 bytes; after explicit budget approval, Q10's fresh
tests, types, packed consumers and size checks pass. Both current-version and
prospective-major release checks still reject publication as described below.

Run from the repository root after completing the pending qualification:

```sh
bun run test
bun run typecheck
bun run test:effect-versions -- --require-complete
bun run test:type-aware
bun run lint
bun run docs:api:check
bun run size
bun run pack:dry-run
bun run version
bun scripts/verify-effect-version-release.ts
```

The current 1.2.0 publication guard correctly rejects the breaking default
change. Testing the same inventory with prospective version 2.0.0 also rejects
publication: a version bump alone does not qualify the remaining rules.
