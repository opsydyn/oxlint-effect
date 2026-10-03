# Public Error-Channel Contracts

API examples in this reference retain the labelled legacy Effect 3 corpus.
For Effect 4 use [versioned guidance](versioned-rules.md) and the paired
current assets linked from the skill entrypoint. Preserve the domain contract,
not legacy API spelling; matching packed consumers verify both corpora.

Read the paired [failures](../assets/public-errors.bad.ts) and
[repairs](../assets/public-errors.good.ts). Each is an adapter around an injected
Effect, not a working profile, session or inventory service. The failing control
has exactly three DDD diagnostics; the passing control is clean under full DDD.

| Rule | Contract to establish | Repair direction |
| --- | --- | --- |
| `linteffect/no-error-as-public-effect-error` | Which operation failed, and what do callers inspect on the existing Error? | Reuse an operation-specific tagged error and preserve the original error as its cause. |
| `linteffect/no-unknown-public-error-channel` | Is the upstream failure understood or still opaque? | Wrap opaque typed failures with operation context; keep their original value without inventing a business classification. |
| `linteffect/no-mixed-effect-error-shapes` | What does each upstream shape mean? | Map documented alternatives into a consistent tagged union with their payloads intact. |

## Mapping And Caller Migration

`loadProfile` maps an existing typed Error to `ProfileUnavailable`, preserving
the exact object in `cause`. The tag is a chosen fixture contract, not proof that
every failure means missing data or permits retry. A caller reading the old
error's message must now deliberately inspect `cause.message` or use its existing
public error adapter. The wrapper's own message is not guaranteed to be the old
message; update serialisation, logging and recovery sites together.

`refreshSession` maps an opaque typed failure to `SessionRefreshFailed`. Its
`cause` remains unknown, including null, undefined, primitives and opaque objects.
The cause field must be present even when its value is undefined. The caller can
recover at the operation level by tag, but must narrow the cause before inspecting
it. Do not cast it to Error, stringify away its payload, or classify it as an
authentication/business error without an established upstream contract.

`readInventory` uses this fixture's explicit adapter convention: strings mean
validation details, numbers mean upstream codes. They become `InventoryRejected`
and `InventoryUnavailable`, respectively. This convention is not inferred by
the linter and must not be copied into a consumer with different semantics.
Empty strings, zero, negative codes and NaN are preserved by the example; it does
not add status-range or non-empty validation. Validate codes separately only when
required by the existing adapter contract.

All three repairs change the error-channel representation while preserving
successes. They are not drop-in, behaviour-preserving replacements for callers
that rely on primitive errors, instanceof Error, messages or serialized fields.
Reuse established error classes and operation context rather than introducing
duplicate error taxonomies. If the upstream already has an appropriate tagged
union, preserve it instead of wrapping every failure again.

## Selective Recovery And Defects

Use `Effect.catchTag` to recover only from the variant owned by the caller. The
tests recover `InventoryRejected` to a test-only sentinel and prove that an
`InventoryUnavailable` passes through unchanged. That sentinel is not a suggested
production inventory fallback: select recovery from the consumer's contract.
Negative type examples reject raw public failures and unrelated recovery tags.

The adapters use `Effect.mapError`: they transform typed failures, not defects,
interruptions or the success channel. Unexpected throws remain defects. Do not
convert all causes to expected domain failures with catch-all cause recovery
merely to satisfy an annotation. When adapting a throwing API, decide at its
boundary which failures are expected and preserve unexpected-defect behaviour.

Causes may contain secrets or implementation details. Keeping a cause for internal
diagnosis does not authorise exposing it in a public response. Retain the
consumer's redaction and transport-error policy, and test public representations
where that is part of the repair.

## Verification Limits

The detectors inspect supported syntax in public Effect annotations, not the
meaning of every runtime failure or cross-file alias. Removing an annotation,
hiding a union behind an alias, adding a cast or suppressing the diagnostic is
not a repair. A clean run does not establish exhaustive business recovery.

Tests verify successes, original cause identity, both mixed variants, selective
recovery, unchanged defects and interruptions; fixtures also typecheck under the repository's Effect
version. In a consumer, verify the installed version and test real callers,
transport adapters and defect/interruption behaviour as applicable. Preserve
the intentionally failing `EXPECT`/`QA` corpus.
