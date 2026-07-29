# Testing Observability And QA Slice 2 Implementation Plan

> **For implementation:** use `superpowers:executing-plans` or the approved
> inline execution workflow and complete tasks in order.

**Goal:** Add three strict, import-gated test-shape rules to the public
`testingObservabilityAndQa` group without changing the recommended rule set.

**Architecture:** Reuse the existing Effect-import and filename glob helpers.
Each rule recognises only a direct AST shape, collects candidates, and reports
after `Program:exit` confirms an Effect ecosystem import. The final task
separates `recommendedRules` from `allRules`, then proves the strict group
through its own CLI config, examples, configuration tests, and documentation.

**Tech stack:** TypeScript, Oxlint JavaScript plugin API, Bun test, Oxlint CLI.

**Design source:** `docs/superpowers/specs/2026-07-29-testing-observability-and-qa-slice-2-design.md`

## Task 1: Detect discarded `Effect.runPromise`

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`

### Step 1: Write failing unit tests

Add AST fixtures only as required for direct test calls, function callbacks,
blocks, expression statements, return statements, and await expressions. Add
focused tests for `linteffect/no-runpromise-in-non-async-test-body`:

1. reports a discarded direct `Effect.runPromise(...)` expression in a
   block-bodied `it` callback;
2. accepts awaited and returned direct calls;
3. accepts an expression-bodied callback that implicitly returns the call;
4. supports `it`, `test`, `specify`, and `bench`;
5. ignores non-test paths, test files without an Effect import, aliases, and
   unsupported wrappers;
6. reports when the Effect import is visited after the test candidate.

Use `/repo/tests/order-service.test.ts` for positive cases and
`/repo/src/order-service.ts` for non-test cases.

Run: `bun test tests/plugin.test.ts`

Expected: tests fail because the rule is absent.

### Step 2: Implement the smallest direct matcher

In `src/index.ts`, beside the current path helpers, add:

```ts
const defaultTestPaths = ["**/*.test.*", "**/*.spec.*", "**/__tests__/**"] as const;

function isTestPath(context: OxlintContext): boolean {
  return defaultTestPaths.some((pattern) => pathMatchesPattern(context.filename, pattern));
}
```

Add private helpers identifying a direct `it`, `test`, `specify`, or
`bench` call, its final function callback, a direct
`Effect.runPromise(...)` call, and a direct discarded callback-body statement.
For block bodies, report only a top-level expression statement whose expression
is the direct call; allow direct await and return. Allow an expression-bodied
callback with a direct call as its body. Do not resolve aliases, variables, or
nested callbacks.

Create `noRunpromiseInNonAsyncTestBody`. Visit direct test calls in test
paths, collect discarded calls, and report those call nodes at `Program:exit`
only when an Effect ecosystem import was seen. Register it as
`"no-runpromise-in-non-async-test-body"` in `rules`.

### Step 3: Verify and commit

Run: `bun test tests/plugin.test.ts && git diff --check`

Commit:
```bash
git add src/index.ts tests/plugin.test.ts
git commit -m "Add strict Effect test execution rule"
```

## Task 2: Prefer `Effect.flip` for direct typed-error assertions

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`

### Step 1: Write failing unit tests

Add tests for `linteffect/require-effect-flip-for-error-test` which report the
`.rejects` member in this direct shape inside a supported test callback:

```ts
await expect(Effect.runPromise(effect)).rejects.toMatchObject({ _tag: "OrderNotFound" })
```

Add valid cases for non-Effect promises, non-direct `runPromise` arguments,
`.catch(...)`, non-`rejects` matchers, non-test paths, no Effect import, and
an import visited after the test callback.

Run: `bun test tests/plugin.test.ts`

Expected: tests fail because the rule is absent.

### Step 2: Implement the narrow matcher

Add predicates for exactly a non-computed `.rejects` member whose object is
`expect(...)` and whose first argument is a direct `Effect.runPromise(...)`
call. Implement `requireEffectFlipForErrorTest` by inspecting only direct
supported test callbacks in test paths. Traverse a callback only enough to find
this chain and exclude nested function bodies. Import-gate reports at
`Program:exit`, targeting the `.rejects` member.

The diagnostic must explain that `Effect.flip` turns an expected typed failure
into a successful error value for structural assertions; it must not reject
ordinary JavaScript rejection tests universally. Register it as
`"require-effect-flip-for-error-test"`.

### Step 3: Verify and commit

Run: `bun test tests/plugin.test.ts && git diff --check`

Commit:
```bash
git add src/index.ts tests/plugin.test.ts
git commit -m "Add strict Effect error test rule"
```

## Task 3: Flag manual layers next to a service default

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`

### Step 1: Write failing unit tests

Add tests for `linteffect/no-test-mock-layer-when-default-available` with:

```ts
Layer.provide(
  UserService.Default,
  Layer.succeed(FileSystem, fakeFileSystem),
)
```

Assert the report targets `Layer.succeed` or `Layer.effect`, not the whole
provide call. Allow an infrastructure layer next to `.Default`, a manual layer
without a same-call `.Default`, non-test paths, no Effect import, and ensure
one positive case uses a `__tests__` path. Cover import-after-candidate order.

Run: `bun test tests/plugin.test.ts`

Expected: tests fail because the rule is absent.

### Step 2: Implement the sibling-layer matcher

Add predicates for `SomeService.Default`, direct `Layer.succeed(...)` or
`Layer.effect(...)`, and direct `Layer.provide(...)`. Implement
`noTestMockLayerWhenDefaultAvailable` to inspect only test-path provision
calls: when a call has at least one `.Default` argument, report every direct
manual layer argument in that same call. Import-gate reports at `Program:exit`.
Do not infer metadata, resolve variables, or inspect nested layers.

Register it as `"no-test-mock-layer-when-default-available"`.

### Step 3: Verify and commit

Run: `bun test tests/plugin.test.ts && git diff --check`

Commit:
```bash
git add src/index.ts tests/plugin.test.ts
git commit -m "Add strict default layer test rule"
```

## Task 4: Publish and prove the strict group

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/config.test.ts`
- Modify: `tests/oxlint.integration.test.ts`
- Modify: `tests/fixtures/oxlint/oxlint.config.ts`
- Create: `tests/fixtures/oxlint/oxlint.test-shape.config.ts`
- Create: `tests/fixtures/oxlint/test-shape-invalid.test.ts`
- Create: `tests/fixtures/oxlint/test-shape-valid.test.ts`
- Create: `examples/backend/__tests__/testing-observability-and-qa-test-shape-anti-patterns.test.ts`
- Modify: `README.md`
- Modify: `roadmap/08-testing-observability-and-qa/README.md`
- Modify: this plan

### Step 1: Write failing export and CLI tests

In `tests/config.test.ts`, import `recommendedRules`, extend the expected
Testing Observability group to all six rules, prove `ruleGroups` and
`presets` expose them, and assert the exact existing recommended map remains
unchanged without the three Slice 2 names.

In `tests/oxlint.integration.test.ts`, use a dedicated strict-group config.
Assert the invalid fixture produces exactly:

```text
no-runpromise-in-non-async-test-body
require-effect-flip-for-error-test
no-test-mock-layer-when-default-available
```

Assert the valid fixture has status zero and no `linteffect` diagnostic.

Run: `bun test tests/config.test.ts tests/oxlint.integration.test.ts`

Expected: public surface assertions fail until the strict split and fixtures
exist.

### Step 2: Separate recommended from all rules

Add all three names to `testingObservabilityAndQaRules`. Keep `allRules`
derived from all registered rules. Export `recommendedRules`, derived from
all names minus one explicit readonly list containing the three Slice 2 strict
rules. Derive `recommended` from `recommendedRules`, preserving all existing
recommended rules exactly.

Add all three settings to the standard integration config. Add a dedicated
`oxlint.test-shape.config.ts` enabling the strict group. Create valid and
invalid `.test.ts` fixtures; the invalid fixture must trigger exactly one
instance of every new rule.

### Step 3: Add QA examples and documentation

Create the backend `__tests__` example with one intentional anti-pattern per
new rule. Every anti-pattern needs both an `EXPECT` rule-id annotation and a
short `QA` explanation, so `bun run lint:examples` intentionally emits all
three rules.

Update `README.md` to list the rules, state they are opt-in through
`testingObservabilityAndQa` rather than `recommended`, and explain the
typed-error pattern: apply `Effect.flip`, receive the error as a success value,
then assert `_tag`, message, and structured fields. Link to
`https://github.com/PaulJPhilp/EffectPatterns/blob/main/docs/SERVICE_PATTERNS.md`
and state that the rule only covers the narrow direct syntax.

Update Roadmap 08's Slice 2 table entries and checkboxes to `[x]`. Mark this
plan complete only after the final gate succeeds.

### Step 4: Run the package gate and commit

Run:
```bash
bun run test
bun run typecheck
bun run docs:api:check
bun run build
bun run lint
bun run size
bun run pack:dry-run
bun run lint:examples; test $? -ne 0
git diff --check
```

Confirm the intentional example-lint output includes all three new rule IDs
alongside pre-existing diagnostics.

Commit:
```bash
git add src/index.ts tests README.md roadmap/08-testing-observability-and-qa \
  examples/backend/__tests__ docs/superpowers/plans/2026-07-29-testing-observability-and-qa-slice-2.md
git commit -m "Publish testing observability test shape rules"
```

## Final Review

- [x] All three rules are import-gated, test-path-only, and limited to approved
  direct syntax.
- [x] The strict group contains all six testing and observability rules.
- [x] `recommended` excludes Slice 2 while `allRules` includes it.
- [x] Unit, config, CLI, package, and example-lint checks have current evidence.
- [x] README documentation accurately explains `Effect.flip` and references
  EffectPatterns.
