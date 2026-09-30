# Expected State And Failure Boundaries

Read the paired [failures](../assets/expected-state.bad.ts) and
[repairs](../assets/expected-state.good.ts). Three targeted rules produce four
diagnostics: the string `NotFound` also triggers `no-adhoc-domain-error`. The
test checks that overlap explicitly rather than suppressing it. The passing
control is clean under full DDD.

| Rule | Contract question | Fixture direction |
| --- | --- | --- |
| `linteffect/no-expected-state-as-error` | Is absence ordinary state or a failed requirement? | Model optional UI selection as Option in the success channel. |
| `linteffect/no-early-catchall-null` | Is missing data being confused with infrastructure failure? | Preserve profile failures until their recovery owner handles them. |
| `linteffect/no-exception-domain-error` | Is the thrown condition a documented expected rejection or an unexpected defect? | Put the expected checkout rejection in the typed failure channel. |

## Ordinary Absence

The fixture accepts a string or undefined selection. `undefined` becomes None;
all supplied strings, including the empty string, become Some. No non-empty
validation or new selection policy is introduced. The repair deliberately
changes the old string failure into successful Option data and wraps present
values too. Update consumers from catch-based absence handling to explicit
Option handling and preserve their UI behaviour at the owning boundary.

The rule recognises particular string failure names, not domain semantics. A
failed mandatory lookup may legitimately be an error, while optional absence is
data. Establish that distinction before applying this example. Do not merely
rename `NotFound` or add a meaningless payload to evade the detector. Reuse the
consumer's existing Option, result variant or error convention.

## Failed Lookup Is Not Missing Data

The bad profile adapter recovers every typed failure to null. It cannot
distinguish absence from unavailable storage. The repair removes that recovery
and propagates the same tagged failure, preserving successes. This intentionally
changes the bad adapter's error and success contracts: null is no longer a
successful fallback. Callers must now own the propagated failure.

Do not substitute Option.none for every caught failure; that still conceals
infrastructure errors. If an upstream contract separately represents actual
missing data, map that recognised variant selectively and let other failures
propagate. Do not infer retryability or absence from an opaque cause or error
message. If null recovery is deliberate at an established boundary, preserve
that contract until its owner approves a change. The rule has configurable
boundary paths; configure real boundaries, not exemptions to hide domain logic.

## Expected Rejection Versus Defect

Both checkout controls use the same `CheckoutRejectedError` with a reason.
Throwing it inside `Effect.gen` creates a defect. The repair uses `Effect.fail`
so typed recovery can recognise the documented expected rejection. Tests verify
the original defect and the repaired failure separately and retain tag and
reason. This is a deliberate channel change, not runtime equivalence.

Do not convert programmer bugs, invariants unexpectedly violated or arbitrary
exceptions into domain failures just because an error class ends with Error.
The detector uses syntax and naming, not knowledge of expected outcomes. Reuse
existing failure variants and update recovery, supervision and transport
adapters with the consumer's contract. Converting a defect to a typed failure
changes which handlers run; agree that classification before repairing.

## Coverage And Limits

With this pair, the companion corpus has annotated failures for every exported
DDD rule. A coverage test compares the unique annotation IDs with `dddRules`,
and each pair checks exact observed diagnostics, clean repairs, packaging and
TypeScript contracts. This covers representative patterns, not every detector
variant or every business interpretation. Negative types reject raw absence,
swallowed profile failures and an invisible checkout failure channel.

These are lint-only fixtures, not a production UI, storage implementation or
checkout service. Verify real caller migration and boundary behaviour in the
consumer. Keep intentional `EXPECT`/`QA` failures and do not confuse a clean
heuristic run with semantic correctness.
