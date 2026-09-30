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

For paired examples of status variants, composed predicates, and explicit
lifecycle states, read [domain decisions](domain-decisions.md). That guide
separates preserved decisions from boundary and transition policy changes.

## Commands, Time, And Options

Read [domain-shapes.bad.ts](../assets/domain-shapes.bad.ts) and
[domain-shapes.good.ts](../assets/domain-shapes.good.ts) together. These add
three intentional warnings and a full-DDD clean control:

1. `linteffect/no-raw-domain-primitive-params`: positional transfer arguments
   become a schema-backed `TransferCommand` with named fields and branded
   accounts/amount. The decoder and encoder keep the existing field names and
   numeric values. The example does not invent positive-amount or non-empty-ID
   rules. Both accounts share a brand, so this does not prove that the caller
   selected the correct source and destination. Check caller intent as well as
   typechecking. Update existing positional callers to construct the command.
2. `linteffect/no-raw-time-domain-field`: `expiresAt` uses an `EpochMillis`
   brand and a schema codec. This example's wire contract is milliseconds since
   the Unix epoch, including fractional values. Encoding preserves the value;
   it does not read the clock or convert to seconds. A brand expresses the unit
   but cannot detect a caller sending seconds as an ordinary number. For elapsed
   time or timeouts use the project's `Duration` model instead. Never substitute
   a duration for an absolute instant. Choose range/precision constraints only
   when they are part of the consumer's existing contract.
3. `linteffect/no-overloaded-options-object`: `PaymentIntent` names invoice ID,
   amount, and optional memo. Omitted, explicitly undefined, empty, and populated
   memos are covered by tests. The example decoder rejects extra properties
   explicitly so that accidental fields are not silently discarded. This is a
   chosen example policy, not equivalent to accepting arbitrary `any` values.
   Confirm required fields, nullable versus optional fields, and extension-field
   behaviour before applying a schema to a consumer. Preserve supported
   extensions explicitly when required.

The synchronous decoders here make fixture validation observable as thrown
parse errors. In Effect application boundaries, use `Schema.decodeUnknown` and
map parse errors through the consumer's existing error contract as appropriate.
Do not move throwing decoders into Effect domain logic without owning that
failure path.

The tests also compile negative type examples: raw primitives cannot bypass the
transfer command, an account ID cannot fill the time field, and payment options
cannot omit the required amount. Runtime roundtrips cover zero, negative and
fractional numbers; business limits must still be decided by the application.

## Error Modeling Within DDD

Read [public errors](public-errors.md) for paired public-channel failures and
repairs, cause preservation, and selective recovery tests.

Read [domain context](domain-context.md) for paired examples of explicit policy
requirements, modelled clock input, and meaningful tagged failure payloads.
The guide distinguishes detector acceptance from authorisation and makes the
example's deliberate policy changes explicit.

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

Read [expected state](expected-state.md) for absence, broad null-recovery and
thrown-rejection pairs, including explicit caller and failure-channel changes.

For `linteffect/no-effect-fail-error-message`, retain the structured failure
instead of reducing it to text. For `linteffect/no-catchall-generic-rethrow`,
`linteffect/no-log-only-error-handling`, `linteffect/no-early-catchall-null`, and
`linteffect/no-exception-domain-error`, establish who owns recovery and what
must remain observable. Prefer selective tagged recovery where supported by
the installed Effect version. Logging alone does not establish recovery.

Read [error preservation](error-preservation.md) for paired message-loss,
generic-rethrow and log-only failures, with identity and executed-logging tests.
It also documents the heuristic's legitimate `tapError` observation case.

## Verification Boundaries

Test decoding failures, identifier interchange, both behaviour modes, every
supported state transition, and callers that inspect error payloads as relevant
to the repair. Run the selected DDD rules and the consumer's complete configured
lint policy: a DDD-clean example may still violate a different selected group.

Keep fixtures marked `EXPECT`/`QA` intentionally failing. If the rule misses its
annotated pattern, report a detector/example discrepancy; do not change business
code just to provoke a warning. A passing heuristic check is not evidence of
aggregate invariants, access control, or cross-file type correctness.
