# linteffect QA Examples

The companion agent skill has paired [DDD failures](../skills/oxlint-effect/assets/domain.bad.ts)
and [passing repairs](../skills/oxlint-effect/assets/domain.good.ts). They cover
branded IDs, notification modes, and structured errors.
`bun test tests/agent-skill.test.ts` checks exact failure diagnostics, a clean full-DDD
control, TypeScript contracts, and representative behaviour. The existing
anti-pattern corpus below remains intentionally invalid.

The [domain shape failures](../skills/oxlint-effect/assets/domain-shapes.bad.ts)
and [repairs](../skills/oxlint-effect/assets/domain-shapes.good.ts) add primitive-heavy
parameters, raw time fields, and overloaded options. The same test suite checks
exact warnings, clean repairs, compile-time misuse, roundtrips, and optional
memo semantics.

The [domain decision failures](../skills/oxlint-effect/assets/domain-decisions.bad.ts)
and [repairs](../skills/oxlint-effect/assets/domain-decisions.good.ts) add raw
status strings, combined business comparisons, and conflicting lifecycle flags.
Tests cover decision equivalence, supported flag roundtrips, invalid boundary
inputs, and allowed/forbidden transitions at runtime and compile time.

The [domain context failures](../skills/oxlint-effect/assets/domain-context.bad.ts)
and [repairs](../skills/oxlint-effect/assets/domain-context.good.ts) demonstrate
explicit deletion-policy requirements, deterministic time inputs, and structured
denials. Tests check policy invocation, failure identity, expiry thresholds and
rejected type misuse. The [context guide](../skills/oxlint-effect/references/domain-context.md)
states the deliberately chosen policies and the limits of these examples.

The [public error failures](../skills/oxlint-effect/assets/public-errors.bad.ts)
and [repairs](../skills/oxlint-effect/assets/public-errors.good.ts) demonstrate
generic, unknown, and mixed public error channels. Tests cover successful values,
original failure details, selective tagged recovery, defects and interruptions.
The [public error guide](../skills/oxlint-effect/references/public-errors.md)
explains the required caller migration and adapter-specific failure semantics.

The [error preservation failures](../skills/oxlint-effect/assets/error-preservation.bad.ts)
and [repairs](../skills/oxlint-effect/assets/error-preservation.good.ts) demonstrate
message loss, generic rethrows and log-only recovery. Tests check original error
identity, executed logging, successful values and failure propagation. The
[preservation guide](../skills/oxlint-effect/references/error-preservation.md)
distinguishes recovery ownership from legitimate `tapError` observation.

The [expected-state failures](../skills/oxlint-effect/assets/expected-state.bad.ts)
and [repairs](../skills/oxlint-effect/assets/expected-state.good.ts) complete the
companion DDD corpus with ordinary absence, broad null recovery and thrown
expected rejection. Tests compare annotation coverage against every DDD rule,
preserve empty selections, and distinguish defects from typed rejections. The
[guide](../skills/oxlint-effect/references/expected-state.md) explains caller migration.

This folder is a lint-only QA corpus. It is intentionally full of anti-patterns and is not meant to be built, run, or fixed.

Each problematic snippet has an annotation:

```ts
// EXPECT: linteffect/no-effect-sync-console
// QA: Effect.sync should not hide console side effects.
const audit = Effect.sync(() => console.log("created"));
```

Run the example lint pass from the repository root:

```bash
bun run lint:examples
```

The command is expected to report `linteffect/*` diagnostics and may exit non-zero because these files are intentionally invalid. A missing diagnostic for an `EXPECT` annotation is feedback: either the example does not match the rule's trigger shape, or the rule implementation has a defect.

To compare unique expected rule IDs with observed rule IDs:

```bash
rg -o "EXPECT: linteffect/[a-zA-Z0-9-]+" examples \
  | sed "s/.*EXPECT: //" \
  | sort -u > /tmp/linteffect-expected.txt

bun run lint:examples > /tmp/linteffect-observed.log 2>&1 || true

rg -o "linteffect\\([^)]+\\)" /tmp/linteffect-observed.log \
  | sed "s/linteffect(/linteffect\\//; s/)//" \
  | sort -u > /tmp/linteffect-observed.txt

comm -23 /tmp/linteffect-expected.txt /tmp/linteffect-observed.txt
```

The final `comm` command should print no lines for implemented rules. Future
rule examples intentionally remain in the missing set until the matching rule is
shipped.

## Rule QA Inventory

Every exported rule must have a README table entry, an adjacent `EXPECT` and
`QA` anti-pattern annotation, and an entry in
`docs/rule-qa-inventory.json`. The inventory maps a rule to its completed
roadmap README or to `legacy/parity` for shipped rules that predate a roadmap
group.

Run the contract check after changing an exported rule:

```bash
bun test tests/rule-qa.test.ts
```

## Beyond-Parity Examples

Some files document beyond-parity rule families as QA fixtures. They use
`EXPECT` annotations so the intended diagnostic shape is clear and missing
diagnostics can be treated as implementation gaps.

- `backend/domain-modeling-anti-patterns.ts` mirrors the domain-modeling
  rules in `roadmap/05-domain-modeling/README.md`.
- `backend/correctness-core-anti-patterns.ts` mirrors the correctness-core
  rules in `roadmap/01-correctness-core/README.md`.
- `backend/concurrency-safety-anti-patterns.ts` mirrors the concurrency-safety
  rules in `roadmap/02-concurrency-safety/README.md`.
- `backend/resource-lifetime-anti-patterns.ts` mirrors the implemented Resource
  Lifetime rules in `roadmap/03-resource-lifetime/README.md`; the deferred
  `no-scope-global` candidate is intentionally absent from the plugin.
- `backend/error-escapes-anti-patterns.ts` mirrors the correctness-core
  error-escape slice in `roadmap/01-correctness-core/README.md` and Error
  Modeling Slices 2, 3, and 4 in `roadmap/04-error-modeling/README.md`.
- `backend/imperative-escape-hatches-anti-patterns.ts` mirrors the
  correctness-core promise and imperative escape-hatch slice in
  `roadmap/01-correctness-core/README.md`.
- `backend/public-error-contract-anti-patterns.ts` mirrors the final
  correctness-core public error contract rule in
  `roadmap/01-correctness-core/README.md` and Error Modeling Slice 1 in
  `roadmap/04-error-modeling/README.md`.
- `backend/effect-flow-anti-patterns.ts` mirrors both Effect Flow slices in
  `roadmap/09-effect-flow/README.md`.
- `backend/pure-transformation-anti-patterns.ts` mirrors both Pure
  Transformation slices in `roadmap/10-pure-transformation/README.md`.
- `backend/behavior-decoration-anti-patterns.ts` mirrors the Behavior
  Decoration slice in `roadmap/11-behavior-decoration/README.md`.
- `backend/style-separation-anti-patterns.ts` mirrors the Style Separation
  slice in `roadmap/12-style-separation/README.md`.
- `backend/service-layer-architecture-anti-patterns.ts` mirrors the Service
  and Layer Architecture slice in
  `roadmap/06-service-and-layer-architecture/README.md`.
- `backend/__tests__/testing-observability-and-qa-test-shape-anti-patterns.test.ts`
  mirrors the strict Test Shape slice in
  `roadmap/08-testing-observability-and-qa/README.md`.

## npm Consumer Example

`npm-consumer` is a tiny standalone consumer that installs
the published 1.x `@opsydyn/oxlint-effect` package from npm instead of using
the local source plugin.
It verifies the user-land `jsPlugins: [...recommended.jsPlugins]` workaround for
Oxlint's mutable config type and gives us a production-package smoke test.

## Type-Aware Consumer

`type-aware-consumer` is an isolated TypeScript 7 fixture for the opt-in
`typeAware` preset. It combines the existing syntax-only `linteffect/*` rules
with consumer-selected Oxc built-in `typescript/*` rules; it is not a clean
application.

For local development, build the root package and run the fixture commands:

```bash
bun run build
cd examples/type-aware-consumer
bun install
bun run typecheck
bun run lint
bun run lint:valid
```

`lint` intentionally exits non-zero against the annotated
[failure corpus](./type-aware-consumer/src/), while
[valid controls](./type-aware-consumer/src/valid-controls.ts) must remain
clean. The root [pack-backed gate](../package.json) runs the temporary consumer
against the packed package:

```bash
bun run test:type-aware
```

For missing-engine, project, declaration, and configuration-scope failures,
see the [type-aware setup failure modes](./type-aware-consumer/failure-modes/README.md).
