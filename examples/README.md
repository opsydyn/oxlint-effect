# linteffect QA Examples

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
- `backend/resource-lifetime-anti-patterns.ts` mirrors the Resource Lifetime
  rules in `roadmap/03-resource-lifetime/README.md`.
- `backend/error-escapes-anti-patterns.ts` mirrors the correctness-core
  error-escape slice in `roadmap/01-correctness-core/README.md` and Error
  Modeling Slice 2 in `roadmap/04-error-modeling/README.md`.
- `backend/imperative-escape-hatches-anti-patterns.ts` mirrors the
  correctness-core promise and imperative escape-hatch slice in
  `roadmap/01-correctness-core/README.md`.
- `backend/public-error-contract-anti-patterns.ts` mirrors the final
  correctness-core public error contract rule in
  `roadmap/01-correctness-core/README.md` and Error Modeling Slice 1 in
  `roadmap/04-error-modeling/README.md`.
- `backend/effect-flow-anti-patterns.ts` mirrors the first Effect Flow slice in
  `roadmap/09-effect-flow/README.md`.
- `backend/pure-transformation-anti-patterns.ts` mirrors the first Pure
  Transformation slice in `roadmap/10-pure-transformation/README.md`.
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
`@opsydyn/oxlint-effect@0.2.0` from npm instead of using the local source plugin.
It verifies the user-land `jsPlugins: [...recommended.jsPlugins]` workaround for
Oxlint's mutable config type and gives us a production-package smoke test.
