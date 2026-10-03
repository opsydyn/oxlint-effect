# Effect 4 Release Preparation

Target: **2.0.0**, staged by `.changeset/effect4-first-class.md`.
Status: **locally qualified and reviewed; ready for separately authorised versioning, not published**.
Package version remains 1.2.0 until the major changeset is applied. No tag, push or
publication is part of this preparation.

Latest local gate (2026-10-03): all 52 behavioural batches and group/skill
composition pass. 586 tests / 5418 expectations, root types, both packed majors
in complete mode, packed typeAware, publint, API docs, pack inspection and size
pass. Size is 29,860 bytes under the unchanged 30,000-byte cap. All applicable
rule/group entries are qualified. The prospective 2.0.0 guards pass, while the
actual 1.2.0 publication guard rejects the unapplied major release. A fresh
whole-campaign review completed; four findings were fixed and verified; remote CI and publication are not established.

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
- [x] Close Q22 cleanup/manual-scope/resource-success qualification: final complete gate and size pass.
- [x] Close Q23 acquisition/request/global qualification: final complete gate and size pass.
- [x] Close Q24 nesting/provision/runner qualification: final complete gate and size pass.
- [x] Close Q25 hidden execution/boundary/filesystem qualification: final complete gate and size pass.
- [x] Close Q26 decoding/clock/platform qualification: final complete gate and size pass.
- [x] Close Q27 environment/config qualification: final complete gate and size pass.
- [x] Close Q28 observability qualification: final complete gate and size pass.
- [x] Close Q29 test qualification: final complete gate and size pass.
- [x] Close Q30 domain vocabulary qualification: final complete gate and size pass.
- [x] Close Q31 command/time/options qualification: final complete gate and size pass.
- [x] Close Q32 lifecycle/error qualification: final complete gate and size pass.
- [x] Close Q33 context/clock qualification: final complete gate and size pass.
- [x] Close Q34 Option/Match qualification: final complete gate and size pass.
- [x] Close Q35 decoded-model/nullish qualification: final complete gate and size pass.
- [x] Close Q36 boolean/outcome qualification: final complete gate and size pass.
- [x] Close Q37 workflow qualification: final complete gate and size pass.
- [x] Close Q38 business-workflow qualification: final complete gate and size pass.
- [x] Close Q39 pure-flow qualification: final complete gate and size pass.
- [x] Close Q40 call-tower qualification: final complete gate and size pass.
- [x] Close Q41 ladder qualification: final complete gate and size pass.
- [x] Close Q42 pipe/tower/recovery qualification: final complete gate and size pass.
- [x] Close Q43 wrapper qualification: final complete gate and size pass.
- [x] Close Q44 collection/value qualification: final complete gate and size pass.
- [x] Close Q45 branching qualification: final complete gate and size pass.
- [x] Close Q46 exception/IIFE qualification: final complete gate and size pass.
- [x] Close Q47 callback/absence qualification: final complete gate and size pass.
- [x] Close Q48 object-value qualification: final complete gate and size pass.
- [x] Close Q49 React/runtime qualification: final complete gate and size pass.
- [x] Close Q50 loading/render/provision qualification: final complete gate and size pass.
- [x] Close Q51 atom/logging qualification: final complete gate and size pass.
- [x] Close Q52 state/envelope qualification: final complete gate and size pass.
- [x] Complete group/preset and packaged skill/documentation composition checks,
  including failures and repairs for both supported majors. Group qualification
  is conjunctive with every applicable member and the unchanged size gate; all pass.
- [x] Obtain the fresh whole-campaign review required by the approved plan.
- [x] Pass the complete Effect version gate, unit tests, typecheck, packed
  consumers, type-aware consumer, publint, API docs, size and package inspection.
- [ ] Apply Changesets versioning, confirm 2.0.0 and generated changelog, then
  rerun the real publication guard against the resulting package version.
- [ ] Push only when authorised and release-ready; merge the generated release
  PR, then verify npm publication and GitHub release independently.

## Verification Commands

Fresh closure checks passed: 586 unit tests / 5418 expectations, root typecheck,
both packed Effect consumers in complete mode, packed typeAware, publint, API
docs, dry-run package inspection and size. Earlier size failures are retained in
the historical campaign report. Prospective-major inventory guards pass;
the current-version publication guard still rejects version 1.2.0 as intended.

Run from the repository root when separately authorised to apply the release:

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
