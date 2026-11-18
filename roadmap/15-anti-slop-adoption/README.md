# 15 Selective Anti-Slop Adoption

Status: agent guidance and the approved opt-in cause-loss detector are complete
locally, including both complete packed-major suites. No new preset,
recommended default or hosted AI judge. Publication remains a separate gate.

Reference: [K-Mistele/anti-slop](https://github.com/K-Mistele/anti-slop), reviewed at
`b7c1619b4d51b4815e89ba3700a975a6ec54b8c3` on 2026-11-16. Ideas are assessed
against this plugin's installed APIs and contracts, not adopted as universal style.

## Candidate Decisions

| Candidate | Existing Coverage | Decision And Remaining Work |
| --- | --- | --- |
| Cause-preserving narrowing | Message-only failures/generic rethrows plus the new opt-in constructor-input check. | `no-error-cause-loss` now checks the explicit retention contract in errorModeling/ddd/allRules. Opaque code remains unknown; captured-and-erased translations may be valid outside that selected policy. |
| Redundant ambient service re-provision | Runtime/layer placement rules do not establish same-tag/same-instance redundancy. | Separate service-architecture slice. Resolve service and implementation bindings, distinguish dynamic overrides and layer-local acquisition, and prove lifetime/dependency preservation. Do not compare source text as proof of identity. |
| Tests that cannot meaningfully fail | Effect test ownership/flip rules and runtime completion markers, not arbitrary test adequacy. | Add a concrete erasure counterexample now. General review belongs in the agent skill unless a narrow deterministic failure can be established; no blanket inline-assertion or mocking ban. |

The upstream narrowing rule mainly targets handlers that never reference their
input, accepts cause-shaped/spread arguments and some preceding tap operations.
Reading `error.message` can still erase a structured cause, and a tap's presence
does not prove capture ran. Do not describe these heuristics as causal retention.

The upstream skill also mandates service/file/naming patterns. This repository
does not adopt those blanket policies. Context.Service/Effect.Service closures
can validly capture construction dependencies; test helpers and intentional
recovery require the consuming repository's contract, not a universal ban.
Even a same-instance re-provision can intentionally pin a dependency for work
executed later under a different environment. Same binding identity is necessary
for a precise detector but is not sufficient to justify removing that provision.

## Slice 1: Cause Preservation Guidance

- [x] Assess overlap and document three candidate decisions.
- [x] Add focused current/legacy guidance and discoverable skill routing.
- [x] Add labelled review-only failures and clean repairs in both majors.
- [x] Add runtime and negative-type contracts, including failure/cause identity,
  observer sequencing, public disclosure, success and environment preservation.
- [x] Add a counterexample showing tag-only assertions accept cause erasure.
- [x] Complete root, package, both packed-major, type-aware and size checks.
- [x] Prepare the verified local slice for commit; publishing remains separate.

Verified: 615 tests / 5779 expectations, full pinned Effect 3.22.1 and 4.0.0
packed consumers, type-aware, types, publint, API docs and package contents. The
runtime bundle remains 29,946 / 30,000 compressed bytes. The standalone Python
skill validator could not start without PyYAML; repository metadata/link/content
tests passed. See the [completion record](../../docs/superpowers/reports/2026-11-16-anti-slop-cause-guidance.md).

Examples: [current failures](../../skills/oxlint-effect/assets/effect4/cause-narrowing.bad.ts)
and [repairs](../../skills/oxlint-effect/assets/effect4/cause-narrowing.good.ts);
[legacy failures](../../skills/oxlint-effect/assets/cause-narrowing.bad.ts) and
[repairs](../../skills/oxlint-effect/assets/cause-narrowing.good.ts).
The [reference-app example](../../examples/backend/cause-narrowing-review.ts)
now has inline warnings for the new rule. The source assets likewise carry
three EXPECT annotations under the opt-in policy. The original review-only
measurements above are historical; opaque forms still do not imply lint coverage.

## Slice 2: Opt-In Cause-Loss Detector

| Status | Rule | Selection | Scope |
| --- | --- | --- | --- |
| [x] | `linteffect/no-error-cause-loss` | errorModeling, ddd, allRules; not recommended/typeAware | Inline synchronous map/broad recovery returning new constructors whose visible inputs do not retain the original |

- [x] Real-CLI RED/GREEN tests for constructor inputs, property order, aliases,
  scopes and unknown-input controls; direct unit and config coverage.
- [x] Promote the former review-only corpus to actual warnings in both majors.
- [x] Verify the 22-member DDD union and recommended exclusions in packed consumers.
- [x] Review a measured 31 KB cap, without hidden output or dependency upgrades.
- [x] Finish the complete packed, root, type-aware, docs and package gates.
- [x] Prepare the verified local change for commit.

Verified: 632 tests / 5966 expectations, both complete pinned-major consumers,
packed type-aware, types, publint, API docs, package contents and release guard.
The runtime measures 30,650 / 31,000 Brotli bytes. See the
[completion record](../../docs/superpowers/reports/2026-11-16-opt-in-cause-loss.md).

See [ADR 0004](../../docs/adr/0004-opt-in-cause-loss-policy.md) for the policy,
trade-offs and explicit size-budget decision. Constructors can ignore passed
values; this rule is not proof of storage or runtime semantics. `catchCause`
also handles non-typed reasons, so selecting its error translation remains an
owner decision rather than an automatic repair suggestion.

## Next Gates

- [x] Design cause-loss lint precision and opt-in policy before registering a new ID.
- [x] Address runtime size budget explicitly: 2.2.0 was 29,946 / 30,000 bytes;
  the new measured cap is 31,000 bytes. No hidden entry or dependency upgrade.
- [ ] Assess and qualify same-instance ambient re-provision separately.
- [ ] Extend test-quality review using concrete regressions, not blanket AST claims.

Source/rules remain offline and deterministic. No source upload, paid inference,
credential setup, upstream installation or dependency upgrade is authorised by
this adoption. Runtime fixtures do not prove fresh-session agent adherence.
