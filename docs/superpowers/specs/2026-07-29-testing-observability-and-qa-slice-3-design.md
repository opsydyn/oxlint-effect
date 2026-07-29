# Testing Observability And QA Slice 3 Design

## Goal

Complete Roadmap 08 with repository-owned QA checks that prevent exported
linteffect rules from losing their README explanation, annotated anti-pattern
example, or documented roadmap classification.

## Scope

This slice implements the internal roadmap items:

1. `require-example-fixture-for-rule`
2. `require-rule-doc-entry`

They are Bun test-suite assertions, not public Oxlint rules. They do not change
the plugin API, presets, or runtime lint behaviour.

## Inventory Contract

Add `docs/rule-qa-inventory.json` as the canonical classification map. Every
key is an exported `linteffect/*` rule name without the prefix. Its value is
either:

- a path to the roadmap README that owns the rule; or
- `"legacy/parity"` for shipped parity-era rules that intentionally have no
  Beyond Parity roadmap group.

The inventory must have exactly the same keys as `plugin.rules`: no missing,
stale, or duplicate rule IDs. It makes legacy status explicit rather than
requiring artificial roadmap rows for historic rules.

## QA Test Contract

Add `tests/rule-qa.test.ts`. It reads the plugin registry, inventory, README,
roadmap files, and TypeScript example corpus. It must fail with a sorted,
actionable list when an exported rule:

1. has no `linteffect/<rule>` entry in the README rule tables;
2. has no `// EXPECT: linteffect/<rule>` annotation under `examples/`;
3. has no inventory entry, or the inventory contains a non-exported rule;
4. names a missing roadmap file; or
5. maps to a roadmap file that lacks a completed `[x]` row for that rule.

`legacy/parity` entries intentionally skip the roadmap-row assertion. All
rules, including legacy/parity rules, still require README and example coverage.

Do not parse TypeScript source to discover rule names. Import the actual plugin
registry so the test follows the public shipped surface.

## Documentation And Backfill

Backfill the current audit gaps:

- README entry for `linteffect/no-effect-orElse-ladder`;
- annotated examples for
  `no-if-statement`, `no-ternary`, `no-branch-in-object`,
  `no-atom-registry-effect-sync`, `no-family-collection-read`,
  `no-effect-orElse-ladder`, and `no-effect-succeed-variable`.

Add the inventory contract to `examples/README.md` so contributors know that
every new exported rule needs a README entry, `EXPECT`/ `QA` example, and
explicit roadmap or legacy classification.

Update the `Effect.flip` guidance in the package README to link both
EffectPatterns service-test guidance and the official
`Effect.flip` API documentation:

`https://effect-ts.github.io/effect/effect/Effect.ts.html#flip`

## Verification

Test first by adding failing QA tests before the inventory and backfills. The
new test must pass after the inventory is complete. Then run:

```bash
bun run test
bun run typecheck
bun run docs:api:check
bun run build
bun run lint
bun run size
bun run pack:dry-run
bun run lint:examples
git diff --check
```

`lint:examples` remains intentionally non-zero. Its observed IDs must cover
every `EXPECT` annotation, including the Slice 3 backfills.

## Out Of Scope

- Public `linteffect/*` meta-rules or a new preset.
- Parsing arbitrary documentation prose beyond stable rule IDs and roadmap
  checklist rows.
- Reconstructing historic roadmap groups for legacy/parity rules.
