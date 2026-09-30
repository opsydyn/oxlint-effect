# Domain Context, Time, And Failure Ownership

Read the paired [failures](../assets/domain-context.bad.ts) and
[repairs](../assets/domain-context.good.ts). The three annotated failures are
checked against the full DDD preset; the passing control also typechecks.

## Explicit Context

`linteffect/no-domain-meaning-by-folder-only` detects contextual function names
around raw identifiers. It does not inspect access-control correctness. A
branded ID can satisfy this detector without establishing caller authority.

The repair reuses `UserId` and requires a `DeletionPolicy` service. The operation
consults that policy before returning the target ID. Tests supply an allowing
policy and a denying policy; the original denial object propagates unchanged.
The negative type fixture proves that the service requirement cannot be treated
as an environment-free Effect.

This is an authorisation-contract example, not a user-deletion implementation.
There is no persistence write in either control. The original helper always
succeeded; adding denial is a deliberate policy change, not behaviour-preserving
refactoring. In a consumer, reuse its established policy and principal context,
and retain the actual protected operation after authorisation. Resolve the
authenticated actor at a trusted boundary; never supply an allowing policy based
on an untrusted request flag. A caller can still provide an unsafe service.
Neither a tag nor a clean lint run proves access control or prevents races
between checking a policy and writing data.

## Time Ownership

`linteffect/no-new-date-in-domain-logic` reports Date construction outside its
configured boundaries in Effect-importing files, including conversion of a
supplied timestamp. Determine whether the code reads time or converts a value
before selecting a repair. Do not enable boundary exemptions merely to hide a
domain clock read.

The control accepts a modelled `EpochMillis` input and compares it with a lease's
expiry. This example chooses inclusive expiry (`now >= expiresAt`); tests cover
before, at, and after the threshold, negative timestamps and fractional values.
This slice deliberately requires finite instants: its decoder rejects `NaN` and
both infinities, and the comparison validates both clock and expiry inputs even
when an earlier, broader decoder supplied the branded value. The shared time
shape example remains unconstrained. This finite-value policy is a chosen
validation change; confirm the consumer's sentinel and malformed-input contracts
before adopting it. Runtime validation throws synchronously in this pure fixture;
an application must own that failure path rather than silently treating malformed
time as an unexpired lease.
This is a deterministic replacement direction for a hidden clock read, not an
equivalent implementation of the bad file's timestamp-returning helper.
Preserve the consumer's comparison, return shape and call sites when repairing.

Obtain time once at the owning boundary using the consumer's Effect Clock
convention, then pass it into pure decisions. Alternatively read Clock within an
Effect and control it through the project's test-clock setup. Avoid mixing
seconds, milliseconds and durations. The brand prevents accidental typed
interchange but cannot detect a caller providing seconds to the number decoder.
The fixture's synchronous decoder throws on malformed values; application
boundaries should use their established Effect-returning decoding/error policy.

## Structured Failure Context

`linteffect/no-empty-error-tag` is a strict payload rule. The example retains
`DeletionDenied` while adding the target `userId` and policy `reason`, which a
caller can use for recovery or diagnosis. Tests assert tag, fields and identity
through the failure channel, without reducing the error to its message.

Choose fields from actual caller needs, not to satisfy a non-empty shape. Update
error constructors, recovery handlers and public adapters together. Preserve
existing causes and external representations where required; never expose
sensitive policy details in public responses just because they exist internally.
When a tag represents ordinary expected state with no useful failure context,
assess a result variant or Option instead of adding placeholder fields.

## Evidence Limits

These checks establish fixture diagnostics, type contracts and selected runtime
behaviour. They do not qualify production authorisation, clock integration,
storage effects, or agent-generated repairs. Preserve intentional `EXPECT`/`QA`
failures and verify repairs under the consumer's entire configured lint policy.
