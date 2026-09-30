# Recovery Ownership And Error Preservation

Read the paired [failures](../assets/error-preservation.bad.ts) and
[repairs](../assets/error-preservation.good.ts). These wrap a supplied profile
Effect; they do not implement persistence or choose a production recovery policy.
The bad file has three intentional diagnostics. The good file is full-DDD clean.

| Rule | Question before repair | Example direction |
| --- | --- | --- |
| `linteffect/no-effect-fail-error-message` | Do callers expect a structured error or a string? | Preserve the original tagged error instead of failing with its message. |
| `linteffect/no-catchall-generic-rethrow` | Does the adapter need a new public error contract? | Remove an erasing handler when the original tagged contract is already appropriate. |
| `linteffect/no-log-only-error-handling` | Is this observation or owned recovery? | When failure must propagate, execute logging and then re-fail with the original error. |

## Preserve Details, Not Just Text

`rejectProfile` fails with the supplied `ProfileUnavailable` rather than its
message. Tests assert original error identity, tag and cause. Changing from a
string error channel to a tagged one changes callers' contract: migrate their
comparisons, recovery and public adapters together. Do not assume the tagged
wrapper's message is its cause's message or expose internal causes publicly.

`rethrowProfile` removes the generic catch-all replacement and returns the
original Effect. Its success value and typed failure pass through unchanged.
This does not preserve the bad wrapper's generic Error representation. If a
consumer deliberately owns a different boundary error, use its established
mapping while retaining the original cause; see [public errors](public-errors.md).
Do not introduce redundant catch-and-re-fail code when no observation or mapping
is needed.

## Observation Is Not Recovery

The bad `observeProfile` uses `catchAll` with `Effect.logError`. A successful
logging Effect recovers the original typed failure to successful void. The good
example chooses propagation instead: its handler yields logging, then yields
`Effect.fail(error)`. Tests capture one log entry containing the original error,
assert the same failure reaches the caller, and verify successes do not log.
Logging must actually be sequenced: merely constructing an Effect in a handler
does not execute it.

This is a chosen ownership change, not equivalent recovery. If the consumer's
boundary intentionally owns recovery to void, retain that contract until the
owner decides otherwise. Choose a fallback or result variant only from its
business requirements. Never replace successful recovery with failure solely
to clear a diagnostic.

`tapError(error => Effect.logError(error))` is different: a successful observer
already preserves the original typed failure. The current heuristic also flags
that log-only callback; the diagnostic does not prove the error was swallowed.
Report that detector/policy mismatch when this is legitimate observation. Do not
put `Effect.fail(error)` inside `tapError` just to satisfy the rule: a failing
observer can alter the resulting cause. Do not add wrappers, casts or suppression
to conceal the warning. Investigate the policy separately from changing runtime
semantics. The full-DDD control uses an explicit catch/log/re-fail handler to
demonstrate failure ownership, not to prescribe replacing every tap observer.

If logging itself fails or defects, the original error is not guaranteed to be
the resulting failure. These examples use Effect's built-in logging with a
successful logger; test the consumer's real observer contract separately.
Avoid logging secrets or duplicating the same event at several ownership layers.

## Verification Boundaries

The paired examples and negative types verify structured failures and a
non-void success channel. They do not establish complete production recovery,
logging delivery, redaction or transport compatibility. Recovery operators here
handle typed failures, not defects or interruptions. Preserve that distinction
and test it when adapting real boundaries.

Keep `EXPECT`/`QA` examples intentionally failing. Run both the focused DDD
policy and the consumer's complete lint configuration on repairs. A clean
heuristic result is not proof that an observer or recovery handler is correct.
