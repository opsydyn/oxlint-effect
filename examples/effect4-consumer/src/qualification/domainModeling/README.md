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
