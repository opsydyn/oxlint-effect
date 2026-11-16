# Effect Policy Recalibration

- result: complete
- claim: the approved fn, public-contract and collection-concurrency slice is implemented locally.
- evidence: 597 tests / 5586 expectations; both complete packed majors; packed typeAware; root types, publint, TypeDoc, package inspection and unchanged size gate.
- remaining uncertainty: pinned Effect 3.21.4 / 4.0.0 qualification, not latest 4.1.x, Bun-native, arbitrary aliases or a whole-preset correctness audit.
- next: needs follow-up; review the staged minor changeset before separately authorising publication.

## Changes

Both recommended maps and their typeAware companions exclude the three
inference-only restrictions. Explicit effectComposition/allRules opt-ins and all
registered IDs remain. New packed good controls use traced generators and typed
service/Layer contracts; runtime checks preserve value 42 and the automatic span.
Unsafe Effect.fn bodies are still checked for throw, try/catch and Promise APIs;
the new owner path excludes unexecuted nested functions.

Collection checks now detect visible unbounded/global Infinity options instead
of omitted sequential scheduling. Last properties, opaque spreads/computed keys,
stored inputs and shadowed Infinity have regressions. Paired major-specific
anti-patterns retain exact counts. Deferred coordination measures sequential
peak 1, bounded peak 2 and unbounded peak 3, with ordered results, failure identity,
retry attempts and teardown retained.

## Verification And Review

Preset and actual Oxlint regressions were observed RED before correction. Further
RED/GREEN regressions exposed missing fn-body checks and shadowed Infinity.
The full packed gates also caught invalid legacy fixture syntax, a fixture
conflicting with the pre-existing legacy service policy, and historical unbounded
examples mislabelled clean; these were corrected before final verification.

Author self-review checked preset compatibility, syntax ownership, effective
property order, runtime oracles and delivery. No independent review is claimed.
No dependencies, rule IDs, unrelated race/resource policies, version bump,
push or publication were included. The minor changeset describes the default
policy migration; the ADR records alternatives and recovery.
