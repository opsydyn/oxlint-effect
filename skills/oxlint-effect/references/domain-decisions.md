# Domain Variants, Predicates, And State Machines

Read the paired [failures](../assets/domain-decisions.bad.ts) and
[repairs](../assets/domain-decisions.good.ts). Each failure has one intentional
DDD diagnostic; the complete repair is linted with the full `ddd` preset.

## Domain Vocabulary

`linteffect/no-magic-domain-string` flags raw status comparisons. The example
uses a named `OrderStatus` schema with the same lowercase wire literals. A
schema-backed `isApproved` predicate answers the existing approval question.
The operation accepts the decoded domain type, not arbitrary status strings.

Supported values retain their original decisions. An unknown status previously
compared false; the new decoder rejects it. This is a boundary-contract change,
not automatically a correct consumer migration. Determine whether unknown
statuses represent malformed input, forward-compatible protocol values, or a
legitimate domain variant. Preserve supported wire values and case sensitivity;
reuse existing schemas instead of inventing a vocabulary.

## Business Predicates

`linteffect/no-domain-logic-in-conditional` detects three or more comparisons
combined in a logical expression. Extracting the same expression into a named
function can still trigger the detector. Give each invariant a name and compose
the predicates meaningfully, rather than obscuring the expression to dodge lint.

The repair names the minimum-total, minimum-item-count, and discount-cap
predicates and composes them using `Predicate.struct`. The thresholds remain
`total > 100`, `itemCount >= 2`, and `discountPercentage <= 20`. Tests compare
the old and new decisions across threshold combinations, NaN, and Infinity.
The example predicates are pure; no effectful calls are moved or reordered.

For a consumer, preserve comparison direction, inclusivity, short-circuit
behaviour, and evaluation order. Do not split effectful checks into an eager
collection or run validations in parallel without a separate business reason.
Name predicates for domain invariants, not individual AST nodes. The consumer
still owns its currency, rounding, and validation policy.

## Lifecycle States And Transitions

`linteffect/no-implicit-state-machine-object` warns when multiple lifecycle
flags are inspected together. It does not discover valid states or transitions.
Recover those contracts from the application and its tests before changing the
model. Multiple flags may be independent facts rather than mutually exclusive
states; a tagged union is appropriate only when exclusivity is established.

The example's chosen lifecycle has these states:

| Variant | Legacy flags | Allowed transition |
| --- | --- | --- |
| Open | `cancelled: false`, `shipped: false` | Ship or cancel |
| Shipped | `cancelled: false`, `shipped: true` | Terminal in this example |
| Cancelled | `cancelled: true`, `shipped: false` | Terminal in this example |

`Schema.TaggedStruct` defines the variants. `shipOrder` and `cancelOrder` require
`Open`, and runtime validation rejects terminal input even if a JavaScript
caller bypasses the TypeScript contract. Compile-time tests reject forbidden
transitions and extra flags on a fresh literal. TypeScript's structural typing
still allows extra fields through an intermediate variable, as another fixture
demonstrates. Runtime validation rejects extra fields during transition and
legacy encoding, including contradictory flags attached to an otherwise valid
tag. The type alone does not guarantee an exact object shape. Runtime tests
exercise both allowed transitions and both terminal rejections.

The legacy decoder accepts exactly the three supported boolean combinations.
The encoder uses exhaustive tagged matching to preserve those flag payloads.
`cancelled: true` together with `shipped: true` is rejected rather than silently
choosing one state. A consumer must explicitly decide how to migrate existing
contradictory persisted records. Never arbitrarily prioritise one flag.

The adapter handles a flags-only envelope and rejects excess properties. Keep
other order data and supported extension fields through the consumer's actual
record adapter; do not feed a full record into this example and discard fields.
The example terminal-state policy is not a rule that all orders must follow.
Refund, return, or post-shipping cancellation may require additional variants
and transitions in the consumer.

## Boundary Errors And Evidence

Synchronous schema decoders/validators throw parse errors in these fixtures.
In an Effect application, map boundary or transition validation failures through
the existing typed error channel, using `Schema.decodeUnknown`/`Schema.validate`
as appropriate. Do not introduce unchecked throws in Effect workflows.

The tests prove the stated example contracts, exact rule IDs/counts, and clean
DDD controls. They do not prove authorization, business completeness, safe
database migration, or correct agent repairs in arbitrary repositories.
