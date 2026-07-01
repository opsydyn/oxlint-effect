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
- `backend/error-escapes-anti-patterns.ts` mirrors the correctness-core
  error-escape slice in `roadmap/01-correctness-core/README.md`.
- `backend/imperative-escape-hatches-anti-patterns.ts` mirrors the
  correctness-core promise and imperative escape-hatch slice in
  `roadmap/01-correctness-core/README.md`.
- `backend/public-error-contract-anti-patterns.ts` mirrors the final
  correctness-core public error contract rule in
  `roadmap/01-correctness-core/README.md`.
