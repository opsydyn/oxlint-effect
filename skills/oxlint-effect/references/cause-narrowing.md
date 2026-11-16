# Cause-Preserving Error Narrowing

Use this when a boundary maps rich internal failures into a caller-facing error.
It is agent review guidance, **not a new runtime lint rule**. The paired bad
examples are labelled `REVIEW-ONLY`, not `EXPECT`: a clean lint result currently
does not diagnose the tagged cause loss shown here. Do not invent a rule ID or
claim that an existing preset enforces this guide.

## Choose The Matching Corpus

| Major | Review counterexamples | Repair | Runtime And Types |
| --- | --- | --- | --- |
| Effect 4 | [bad](../assets/effect4/cause-narrowing.bad.ts) | [good](../assets/effect4/cause-narrowing.good.ts) | [runtime](../assets/effect4/cause-narrowing.contracts.ts), [types](../assets/effect4/cause-narrowing.types.ts) |
| Legacy Effect 3 | [bad](../assets/cause-narrowing.bad.ts) | [good](../assets/cause-narrowing.good.ts) | [runtime](../assets/cause-narrowing.contracts.ts), [types](../assets/cause-narrowing.types.ts) |

These utilities wrap a supplied Effect. They are not a production profile
service, telemetry transport or policy requiring every application error to
contain a cause. Current broad recovery uses `Effect.catch`; legacy uses
`Effect.catchAll`. Both use `mapError` for typed failure transformations.

## Establish The Owner's Contract

Identify which details callers need, which internal failure must remain
available for diagnosis, and who owns reporting and public serialization.
Distinguish preserving the original error object from merely preserving its tag,
message or a reconstructed approximation. An established field other than
`cause` can retain the same evidence; reuse the consumer's representation.

The existing message-only and generic-rethrow rules cover specific erasure
patterns. A new tagged error can still discard the original without triggering
either rule. Conversely, narrowing a fully understood expected domain state can
be intentional. Do not add causes, logging or failure channels without an owned
requirement, and do not rewrite an intentional recovery merely to satisfy style.

## Preserve And Sequence Deliberately

In the repair, `mapProfile` and `recoverProfile` retain the exact `ProviderFailure`
as the new error's cause. Its raw cause remains unchanged, including arbitrary
unknown values. The success value and environment requirement remain intact;
the error representation intentionally changes, so update callers where needed.
Typed mapping does not turn defects or interruptions into domain failures.

`captureAndMap` sequences an observer with `tapError` before mapping. Merely
calling a function that returns a reporting Effect inside `mapError` does not
execute that Effect. Keep `mapError` pure. Use the consumer's configured
observability service and decide where a single event is owned, rather than
adding duplicate reporting at every layer.

Logging is not preservation. A nearby `tapError` does not prove delivery,
durability, redaction or retention of the original. The reference anti-slop rule
allows some preceding observers as an escape hatch; this guide deliberately
does not equate that syntax with a preserved cause. When an owned boundary
intentionally captures and then erases internal details, verify that separate
contract rather than demanding a cause on its public error.

If the observer defects, it can replace the original typed failure. The corpus
tests this explicitly; choose and test the real reporting failure policy instead
of assuming `tapError` can never change the outcome. Avoid logging secrets.

## Keep Internal Evidence Out Of Public Payloads

Retaining internal evidence does not authorise exposing it. `toPublicFailure`
projects the fixture's owned tag and operation only. Do not serialize the whole
error, stack, SDK response or `cause` into HTTP/RPC payloads. Use the consumer's
existing schema and disclosure contract; this example is not a universal wire
format. A typed internal cause is not an automatic redaction mechanism.

## Make Verification Able To Reject The Regression

Check the mapped value, original error identity and structured context. For
capture, assert the original is observed exactly once and successes do not invoke
the observer. Verify dependency requirements and the new error channel at compile
time, plus defects, interruptions and the chosen public projection at runtime.

The bad and good examples have the same public tag and operation: assertions on
only those fields pass for both. The contracts expose that weakness and reject
the erasing control. This is a deterministic test-quality example, not a generic
lint rule proving that arbitrary tests are meaningful. Tests may assert through
helpers or service state; do not require inline assertions or ban test placement.

These packaged contracts are synthetic QA, not proof that an agent follows the
skill in a new repository or that production telemetry delivers an event.

## Reference And Limits

Inspired by [anti-slop's cause-narrowing rule](https://github.com/K-Mistele/anti-slop/blob/b7c1619b4d51b4815e89ba3700a975a6ec54b8c3/src/effect/rules/require-cause-when-narrowing.ts),
not copied wholesale. Retain the consumer's version, contracts and policy.
Ambient service re-provision and general test-quality detection remain separate
follow-ups; this guide adds no new warnings or automatic fixes.
