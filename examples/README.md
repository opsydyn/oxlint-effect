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

## Future Rule Examples

Some files document planned beyond-parity rules before the rule implementation
exists. These examples still use `EXPECT` annotations so the intended diagnostic
shape is clear, but missing diagnostics are expected until the matching roadmap
rule is shipped.

- `backend/domain-modeling-anti-patterns.ts` mirrors the domain-modeling
  candidates in `roadmap/05-domain-modeling/README.md`.
