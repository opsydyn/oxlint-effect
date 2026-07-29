# Testing Observability And QA Slice 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every exported lint rule auditable through an in-repository ownership inventory, a README entry, and an annotated anti-pattern example.

**Architecture:** Add a checked-in canonical inventory that maps exported rule IDs to their owning completed roadmap or `legacy/parity`. A focused Bun test compares the inventory, source plugin, README, examples, and roadmap checkboxes. Keep the two Slice 3 contract labels internal to the roadmap; they are not Oxlint rules and must not be exported or configured.

**Tech Stack:** Bun test runner, TypeScript, Oxlint, checked-in JSON metadata, Markdown documentation.

## Global Constraints

- Preserve every existing public rule, preset, and configuration behaviour.
- Do not add `require-example-fixture-for-rule` or `require-rule-doc-entry` to `src/index.ts`, generated plugin metadata, presets, or package exports.
- Treat every `Object.keys(plugin.rules)` entry as in scope, including legacy/parity rules.
- Every new anti-pattern must retain adjacent `EXPECT` and `QA` comments and must remain intentionally lint-invalid.
- Use the official [Effect.flip API reference](https://effect-ts.github.io/effect/effect/Effect.ts.html#flip) with the existing EffectPatterns guidance in the README.
- The intentional failure of `bun run lint:examples` is part of the verification contract. Assert its exit code is exactly `1`.

---

## Task 1: Add the Rule Documentation QA Contract and Backfill Example Coverage

**Files:**
- Create: `docs/rule-qa-inventory.json`
- Create: `tests/rule-qa.test.ts`
- Modify: `examples/backend/effect-anti-patterns.ts`
- Create: `examples/frontend/react-anti-patterns.ts`

- [x] **Step 1: Write the failing QA test before introducing the inventory.**

  Add `tests/rule-qa.test.ts`, importing the default plugin from `../src/index`. Use `Bun.file` and `Bun.Glob` to load:

  - `README.md`
  - `docs/rule-qa-inventory.json`
  - all `examples/**/*.ts` files
  - all `roadmap/*/README.md` files

  Add helpers that extract identifiers using:

  ```ts
  const ruleIdPattern = /linteffect\/([A-Za-z0-9-]+)/g;
  const expectationPattern = /\/\/ EXPECT: linteffect\/([A-Za-z0-9-]+)/g;
  ```

  The test must verify:

  1. Sorted inventory keys equal sorted `Object.keys(plugin.rules)` exactly.
  2. Every exported rule has a README row matching `| \`linteffect/<rule-id>\` |`.
  3. Every exported rule appears in at least one example `// EXPECT: linteffect/<rule-id>` annotation.
  4. Every inventory owner other than `legacy/parity` names an existing roadmap README and includes a completed `| [x] | \`linteffect/<rule-id>\` |` row.

- [x] **Step 2: Run the focused test and confirm the missing inventory makes it fail.**

  Run:

  ```bash
  bun test tests/rule-qa.test.ts
  ```

  Expected: failure because `docs/rule-qa-inventory.json` does not exist.

- [x] **Step 3: Add the canonical inventory.**

  Create `docs/rule-qa-inventory.json` with exactly one key for every exported plugin rule, sorted alphabetically. Map completed roadmap rules to their existing `roadmap/<group>/README.md` file and all remaining existing rules to `legacy/parity`.

  Generate and independently verify the candidate mapping from current exports rather than relying on a hand-maintained count:

  ```bash
  bun -e 'import plugin from "./src/index.ts"; const paths = await Array.fromAsync(new Bun.Glob("roadmap/*/README.md").scan(".")); const entries = await Promise.all(paths.map(async (path) => [path, await Bun.file(path).text()])); const inventory = Object.fromEntries(Object.keys(plugin.rules).sort().map((id) => [id, entries.find(([, text]) => text.includes("| [x] | \\`linteffect/" + id + "\\` |"))?.[0] ?? "legacy/parity"])); console.log(JSON.stringify(inventory, null, 2));'
  ```

  Do not include future roadmap candidates or the two internal Slice 3 QA labels in this JSON file.

- [x] **Step 4: Backfill the seven missing annotated anti-patterns.**

  In `examples/backend/effect-anti-patterns.ts`, add parse-only declarations for `Atom`, `userAtom`, and `UsersCollectionAtom` as needed. In `examples/frontend/react-anti-patterns.ts`, add a parse-only frontend fixture. Add one adjacent `EXPECT` and `QA` pair for each missing exported rule:

  - `linteffect/no-if-statement`: imperative `if` branching in an Effect module.
  - `linteffect/no-ternary`: a ternary that conceals branching policy.
  - `linteffect/no-branch-in-object`: a conditional expression within an object field.
  - `linteffect/no-atom-registry-effect-sync`: an Atom operation inside `Effect.sync`.
  - `linteffect/no-family-collection-read`: `Atom.family` reading directly from a broad collection atom.
  - `linteffect/no-react-state`: a direct React `useState` call.
  - `linteffect/no-render-side-effects`: a statement-form `Match.value(...).pipe(...)` render branch.

  Include the newly declared and assigned values in the existing final `void [ ... ]` expression so the fixture remains parse-only and self-contained.

- [x] **Step 5: Verify the focused contract and the intentional lint output.**

  Run:

  ```bash
  bun test tests/rule-qa.test.ts
  set +e
  bun run lint:examples > /tmp/linteffect-rule-qa-examples.log 2>&1
  exit_code=$?
  test "$exit_code" -eq 1
  rg -o 'EXPECT: linteffect/[a-zA-Z0-9-]+' examples | sed 's/.*EXPECT: //' | sort -u > /tmp/linteffect-expected.txt
  rg -o 'linteffect\([^)]+\)' /tmp/linteffect-rule-qa-examples.log | sed 's/linteffect(/linteffect\//; s/)//' | sort -u > /tmp/linteffect-observed.txt
  comm -23 /tmp/linteffect-expected.txt /tmp/linteffect-observed.txt
  ```

  Expected: the focused test passes, `lint:examples` exits `1`, and `comm` prints no missing expected rule IDs.

- [x] **Step 6: Commit the implementation contract.**

  ```bash
  git add docs/rule-qa-inventory.json tests/rule-qa.test.ts examples/backend/effect-anti-patterns.ts
  git commit -m "Add rule documentation QA checks"
  ```

## Task 2: Document the Contract and Complete Roadmap 08 Slice 3

**Files:**
- Modify: `README.md`
- Modify: `examples/README.md`
- Modify: `roadmap/08-testing-observability-and-qa/README.md`
- Modify: `docs/superpowers/plans/2026-07-29-testing-observability-and-qa-slice-3.md`

- [x] **Step 1: Link the official Effect.flip documentation.**

  Update the strict error-test guidance in `README.md` so its existing [EffectPatterns service-test guidance](https://github.com/PaulJPhilp/EffectPatterns/blob/main/docs/SERVICE_PATTERNS.md) reference is accompanied by the official [Effect.flip API reference](https://effect-ts.github.io/effect/effect/Effect.ts.html#flip). Keep the explanation lightweight: `Effect.flip` turns an expected typed failure into the success channel so the test assertion is explicit.

- [x] **Step 2: Explain contributor-facing QA ownership.**

  Add a concise `Rule QA Inventory` section to `examples/README.md`. State that any exported rule change must update:

  - the README rule table;
  - an annotated anti-pattern using `EXPECT` and `QA`;
  - `docs/rule-qa-inventory.json`, with either a completed roadmap README owner or `legacy/parity`.

  Include the focused verification command: `bun test tests/rule-qa.test.ts`.

- [x] **Step 3: Mark Slice 3 complete in Roadmap 08.**

  In `roadmap/08-testing-observability-and-qa/README.md`, mark the two Slice 3 internal QA contract entries complete:

  - `require-example-fixture-for-rule`
  - `require-rule-doc-entry`

  Mark the associated Slice 3 checklist complete. These remain roadmap controls only; do not label them as configurable Oxlint rules.

- [x] **Step 4: Run the complete package verification suite.**

  Run:

  ```bash
  bun run test
  bun run typecheck
  bun run docs:api:check
  bun run build
  bun run lint
  bun run size
  bun run pack:dry-run
  set +e
  bun run lint:examples > /tmp/linteffect-rule-qa-examples.log 2>&1
  exit_code=$?
  test "$exit_code" -eq 1
  rg -o 'EXPECT: linteffect/[a-zA-Z0-9-]+' examples | sed 's/.*EXPECT: //' | sort -u > /tmp/linteffect-expected.txt
  rg -o 'linteffect\([^)]+\)' /tmp/linteffect-rule-qa-examples.log | sed 's/linteffect(/linteffect\//; s/)//' | sort -u > /tmp/linteffect-observed.txt
  comm -23 /tmp/linteffect-expected.txt /tmp/linteffect-observed.txt
  git diff --check
  ```

  Expected: all standard package gates pass; the examples lint command exits `1`; and the expected-versus-observed comparison has no output.

- [x] **Step 5: Complete plan evidence and commit the documentation.**

  Change this plan's completed checkboxes to `[x]` only after their commands pass. Record any non-default verification observations in the relevant task step. Then commit:

  ```bash
  git add README.md examples/README.md roadmap/08-testing-observability-and-qa/README.md docs/superpowers/plans/2026-07-29-testing-observability-and-qa-slice-3.md
  git commit -m "Complete testing observability QA roadmap"
  ```

## Final Review

- [x] Confirm the inventory has exactly the exported rule IDs, with no internal QA labels or future candidates.
- [x] Confirm every exported rule has one README table entry and at least one annotated example.
- [x] Confirm each roadmap-owned inventory entry has a completed rule row in the stated roadmap.
- [x] Confirm `Effect.flip` links to the official Effect API documentation.
- [x] Confirm the full verification suite and intentional example-lint contract pass as specified.
