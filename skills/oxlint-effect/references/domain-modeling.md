# Domain Modeling And Structured Errors

These are syntax-based design-smell detectors. Confirm the installed rule's
documented trigger and the actual business contract before deciding on a repair.
`ddd` includes both domain and error modeling; `domainModeling` is narrower.

## Repair Decisions

| Rule | Domain question | Preferred direction |
| --- | --- | --- |
| `linteffect/no-raw-domain-id-alias` | Can IDs from different concepts be interchanged accidentally? | Reuse a branded schema or type; decode at the boundary and keep the brand through callers. |
| `linteffect/no-raw-domain-primitive-params` | Which arguments have distinct meaning, units, or invariants? | Model meaningful values or a typed command; preserve argument order and validation semantics. |
| `linteffect/no-boolean-domain-flag` | What does each boolean value make the operation do? | Name the existing modes explicitly; map both old values at callers. |
| `linteffect/no-magic-domain-string` | Is this a domain variant or an external protocol value? | Reuse a schema/literal union or tagged variant; parse external strings once. |
| `linteffect/no-raw-time-domain-field` | Is this an instant, duration, or timestamp in a particular unit? | Reuse the project's time value type and convert at boundaries without changing units or timezone behaviour. |
| `linteffect/no-overloaded-options-object` | Which combinations are valid? | Introduce a schema or discriminated command with the existing allowed combinations. |
| `linteffect/no-domain-logic-in-conditional` | What invariant does this expression implement? | Extract a named predicate or validation operation with the same truth table. |
| `linteffect/no-implicit-state-machine-object` | Which states and transitions are actually reachable? | Model mutually exclusive states as variants; preserve transitions and persistence adapters. |
| `linteffect/no-adhoc-domain-error` | What information does a caller need to recover? | Use the existing structured error convention and preserve its cause/context. |
| `linteffect/no-domain-meaning-by-folder-only` | Where is caller authority or bounded-context identity established? | Reuse an explicit capability/context or service contract. A name or brand alone is not authorization. |
| `linteffect/no-new-date-in-domain-logic` | Does the operation read the clock or convert an existing timestamp? | Inject a clock/time value using the project's Effect conventions; preserve conversions. |

## Paired Examples

Read [domain.bad.ts](../assets/domain.bad.ts) and
[domain.good.ts](../assets/domain.good.ts) together. The failure file has three
intentional annotated warnings; the repair is checked under the full `ddd`
preset and both files typecheck against this repository's Effect dependency.

1. `UserId = string` becomes a schema brand with a boundary decoder. The example
   adds a non-empty invariant for illustration. Do not introduce that validation
   in a consumer unless its contract already requires it.
2. `shouldNotifyCustomer` becomes `NotificationMode`. `true` maps to `Notify` and
   `false` to `Silent`; the payload still uses the existing boolean representation.
   The named modes improve the operation contract without changing the payload.
3. A string transfer failure becomes `TransferRejected` with operation context.
   This changes the error-channel representation: update consumers and adapters
   together and retain any externally required message/cause semantics.

Branding prevents accidental type interchange; it does not validate input at
runtime. A schema decoder validates at the point where untrusted data enters.
Do not manufacture branded values with type assertions.

## Error Modeling Within DDD

For `linteffect/no-error-as-public-effect-error`,
`linteffect/no-unknown-public-error-channel`, and
`linteffect/no-mixed-effect-error-shapes`, identify the operation's expected
failure variants. Use the existing tagged error model with meaningful fields.
Do not replace an unknown failure with an invented domain error or discard its
cause just to narrow the annotation.

For `linteffect/no-empty-error-tag`, supply fields callers actually need; avoid
placeholder payloads. For `linteffect/no-expected-state-as-error`, distinguish
ordinary absence/state from a failed operation before choosing `Option`, a
variant, or an error.

For `linteffect/no-effect-fail-error-message`, retain the structured failure
instead of reducing it to text. For `linteffect/no-catchall-generic-rethrow`,
`linteffect/no-log-only-error-handling`, `linteffect/no-early-catchall-null`, and
`linteffect/no-exception-domain-error`, establish who owns recovery and what
must remain observable. Prefer selective tagged recovery where supported by
the installed Effect version. Logging alone does not establish recovery.

## Verification Boundaries

Test decoding failures, identifier interchange, both behaviour modes, every
supported state transition, and callers that inspect error payloads as relevant
to the repair. Run the selected DDD rules and the consumer's complete configured
lint policy: a DDD-clean example may still violate a different selected group.

Keep fixtures marked `EXPECT`/`QA` intentionally failing. If the rule misses its
annotated pattern, report a detector/example discrepancy; do not change business
code just to provoke a warning. A passing heuristic check is not evidence of
aggregate invariants, access control, or cross-file type correctness.
