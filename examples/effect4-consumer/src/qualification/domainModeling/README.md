# Domain Modelling Qualification

Q30 covers `no-raw-domain-id-alias`, `no-boolean-domain-flag` and
`no-magic-domain-string`. Each annotated `.bad.ts` has literal expected counts
in the consumer manifest. `.good.ts` files include both repairs and explicitly
labelled detector gaps; clean syntax alone is not proof of domain safety.

The current `domain-vocabulary.ts` uses Schema checks plus brands, explicit
commands and exhaustive Match status mapping. The legacy consumer uses the
matching Effect 3 filter and literal APIs. Compiler controls reject swapped
brands, raw IDs, boolean commands and unknown statuses. Runtime contracts check
unchanged string wire values, notification intent, status values and rejection
of invalid IDs/statuses. Brands alone do not validate their underlying string.

Policy limits are preserved: only directly primitive Id/ID aliases warn; boolean
flags require a recognised prefix and direct annotation; aliases, defaults and
destructuring are opaque. String comparisons are broader than domain state,
including valid discriminant and non-domain checks. Only the exact
`typeof value === "boolean"` form is exempt. Import-order and no-import controls
are explicitly documented gaps, not repairs. These rules have no version option.

Run the repository's `test:effect-versions` packed harness. This is lint/type and
runtime-contract QA, not a launched application or release qualification.

## Q31 Commands And Time Units

`no-raw-domain-primitive-params` checks three or more directly annotated
string/number parameters with matched domain names, not all positional APIs.
`no-raw-time-domain-field` checks its literal timestamp/duration field vocabulary
in interfaces and type literals, including optional fields. Aliases/unions and
renamed fields can conceal raw units. `no-overloaded-options-object` reports
direct any/object annotations on opts/options/config; unknown alone does not
establish decoding. No-import and late-import controls remain clean gaps.

`domain-command.ts` repairs commands with named fields, branded validated IDs
and a finite positive amount. Runtime contracts retain identity and encoded
values, rejecting empty IDs, negative/infinite amounts and missing options.
Options decode from unknown into a UTC DateTime timestamp and Duration timeout.
Round trips retain epoch milliseconds and 1500 ms equals 1.5 seconds; string,
negative and non-finite inputs fail rather than silently coercing. Compiler
controls reject raw IDs/amounts and swapped timestamp/duration values. Current
DateTime.makeUnsafe versus legacy unsafeMake is used only after checked boundary
decoding; invalid boundary values are tested through the typed failure channel.

## Q32 Eligibility, Lifecycle And Structured Errors

`no-domain-logic-in-conditional` counts comparisons inside logical expressions;
nested four-clause chains produce two reports. Naming a compound predicate alone
does not silence the rule. `domain-lifecycle.ts` composes separately named checks
with Predicate.every instead. Runtime controls cover valid, unfunded, negative
and unverified candidates, not every possible domain invariant.

`no-implicit-state-machine-object` counts distinct recognised non-computed flags
on the same identifier. Nested chains can warn more than once. Computed members,
aliases and different objects remain clean controls, not lifecycle safety proof.
The repair is a checked tagged Schema union with exhaustive Match transitions;
tests preserve IDs, terminal identity and idempotence, and reject contradictory
flag objects. Compiler controls require approved-state receipts.

`no-adhoc-domain-error` catches direct literal Effect.fail and thrown new Error
forms. Stored/template/dynamic errors remain opaque. Data.TaggedError carries
user ID, reason and original cause; typed catchTag recovery preserves the exact
failure instance and context. No-import and late-import gaps are retained.

## Q33 Explicit Context And Clock Ownership

`no-domain-meaning-by-folder-only` checks FunctionDeclaration names containing
Admin/Public/Internal/External/Private/Backoffice/Panel plus direct raw ID
parameters. It does not inspect folder semantics. Arrow declarations, alternate
names and aliased/branded types are clean; not all clean controls prove policy.
The repair carries a checked Admin command and branded ID through a typed
Context.Service with explicit Layer provision. Legacy uses Context.Tag with its
different factory order. Compiler/runtime controls reject Public context input.

`no-new-date-in-domain-logic` reports every bare Date constructor outside
configured boundaries, including deterministic explicit conversion, unused
callbacks and unrelated shadowed Date classes. It defers import gating, so Date
construction before a later Effect import still warns. Constructor aliases,
globalThis.Date and Date() remain clean gaps. `main.ts` is a default boundary;
custom paths replace defaults and an empty list removes exemptions. Packed
checks cover all these policies without adding an effectVersion option.

The injected Clock/DateTime repair reads 1000 then 2000 epoch milliseconds under
actual TestClock. It demonstrates deterministic time ownership, not native clock
control or application execution. All 11 domain owners now have behavioural
evidence, but size and whole-campaign gates still prevent final qualification.
