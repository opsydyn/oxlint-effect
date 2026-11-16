# ADR 0004: Opt-In Cause Retention And Measured Size Budget

## Status

Accepted, 2026-11-16, for the approved cause-loss detector and size-budget slice.

## Context

The agent corpus demonstrates cause erasure that passes existing lint rules.
The user approved a deterministic opt-in detector and addressing its runtime
budget. Version 2.2.0 occupies 29,946 / 30,000 Brotli bytes, leaving only 54 bytes.
Blanket cause requirements would reject legitimate owned public translations.

## Decision

Register `linteffect/no-error-cause-loss` for both supported majors. Enable it in
the explicit errorModeling, ddd and allRules selections, but not recommended or
its typeAware companion. No existing group is renamed or removed. This adds
warnings for existing explicit error-group consumers and requires a minor release.

Check inline synchronous identifier/zero-parameter handlers on mapError and
broad typed/Cause recovery. Effect 4 additionally supports mapErrorEager and
catchEager; legacy uses catchAll/catchAllCause. Match actual value imports and
parameter bindings, not name coincidences. Inspect only directly returned new
constructors (including Effect.fail wrapping in recovery) and conditional/block
return branches. Do not descend into arbitrary nested functions or generators.

A direct original argument or an original value in a literal object/array is
visible retention input, without imposing one field name. Field projections,
literals and missing inputs do not retain the original. Respect effective object
keys and later spreads. Opaque helpers, aliases, spreads and reassigned or
destructured handler input remain unknown rather than proved safe. Constructors
may still ignore their arguments; passing an input is not proof of storing it.

Logging does not bypass this retention policy. Enable it only where retaining
the original is the owner's contract. Intentional captured-and-erased public
translation remains valid policy elsewhere; never expose secrets to clear a lint.

Raise the single measured runtime cap from 30 KB to **31 KB**, explicitly for this
addition. The first detector build measured 30,650 Brotli bytes, a 704-byte delta
from 2.2.0. Record the final build in the completion report. Keep one measured
entry, current pinned dependencies and the same compression method. This is not
permission for future unmeasured growth or more dependencies.

## Alternatives And Boundaries

- Adding the rule to recommended would impose an unapproved universal contract.
- Reusing generic-rethrow under its old ID would conflate distinct error policies.
- Treating any parameter read, cause-shaped property or tap as preservation would
  miss message projection, overwritten inputs and unexecuted observation.
- Cross-file/type-checker inference is deferred. AST syntax remains conservative.
- Hiding the detector in an unmeasured secondary entry or removing existing rules
  would make the size metric misleading. A measured 1 KB cap revision is clearer.

Verdict: safe with noted risk. The only shared implementation reuse is existing
value-import recognition; the three concurrency rules retain their policy and
regression suite. No dependency, runtime execution or source-upload boundary moves.

## Acceptance And Recovery

Require RED/GREEN real-Oxlint tests, explicit-default config assertions, annotated
failures/clean controls, both complete packed consumer matrices, typed failure
and runtime identity contracts, and exact rule/group qualification records.
Run root types/tests, package/API-doc checks and the revised 31 KB gate. Keep
historical 30 KB release evidence intact. Do not push or publish this local slice.

Consumers can select narrower explicit rules if their domain intentionally erases
causes. A reviewed revert can remove this new rule and restore the previous cap;
no existing exported ID needs removal or reinterpretation.
