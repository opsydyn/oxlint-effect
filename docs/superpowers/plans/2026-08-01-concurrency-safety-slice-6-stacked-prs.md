# Concurrency Safety Slice 6 And Stacked Pull Requests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three strict concurrency-safety rules for suspension while coordination state is held, expose them through the `concurrencySafety` group without changing `recommended`, and validate the work through unit tests, the CLI fixture, annotated anti-pattern examples, documentation, and the QA inventory. Trial GitHub stacked pull requests with Slice 6 as the bottom branch.

**Architecture:** Keep the plugin's current single-file AST architecture in `src/index.ts`. Add small structural helpers for high-risk suspension detection and direct semaphore/synchronized-reference call shapes. The rules remain conservative and import-gated: they inspect syntax from Effect ecosystem imports, do not use TypeScript type information, do not perform whole-program ownership inference, and do not attempt to prove that arbitrary custom abstractions are safe. Keep Slice 7 and the resource-acquisition rules out of this implementation; create their child stack branches only after their own semantics have an approved design.

**Tech Stack:** Bun, TypeScript, `@oxlint/plugins`, Oxlint CLI, Bun test, Changesets, GitHub CLI, `github/gh-stack`.

## Global Constraints

- Use TDD for every rule: add focused failing tests, implement the smallest detector, then run the focused tests before moving on.
- Preserve existing rule behaviour, exported names, README ordering conventions, and the current `recommended` rule set. The three new rules are strict-only and must not be added to `recommended`.
- Keep detection direct and structural. Do not add a type checker, symbol resolver, whole-program supervisor analysis, or configurable custom abstraction registry in this slice.
- Report one diagnostic per offending coordination call. Do not report synchronous work merely because it occurs inside a semaphore or synchronized-reference API.
- Add an annotated anti-pattern and at least one safe variant for each new rule. The anti-pattern must be observable by `bun run lint:examples`; do not fix the warning in the example.
- Keep stack metadata in `.git/gh-stack`; it is local Git metadata and must not be committed.
- Use `bun` for project commands. Run independent checks only when they do not clean or overwrite shared build output; run build-dependent gates sequentially.
- Do not create or implement the Slice 7 child branches in this slice. The stack trial covers the bottom Slice 6 branch and its PR; future child branches are created from the approved parent branch when their implementation is ready.

---

## File Map

- `src/index.ts`: AST helpers, three rule implementations, registry, strict-rule filtering, and the `concurrencySafetyRules` export.
- `tests/plugin.test.ts`: direct rule visitor tests using the existing hand-built ESTree fixtures.
- `tests/config.test.ts`: public group, preset, and recommended-surface contracts.
- `tests/fixtures/oxlint/concurrency-safety-slice-6.ts`: isolated CLI anti-pattern and safe-variant fixture.
- `tests/fixtures/oxlint/oxlint.concurrency-slice-6.config.ts`: CLI configuration enabling exactly the three new rules.
- `tests/oxlint.integration.test.ts`: exact CLI diagnostic-set assertion for the isolated fixture.
- `examples/backend/concurrency-safety-anti-patterns.ts`: repository QA examples with `EXPECT` and `QA` annotations.
- `README.md`: user-facing rule table and default classification.
- `roadmap/02-concurrency-safety/README.md`: Slice 6 and expansion-backlog checklists.
- `docs/rule-qa-inventory.json`: exported-rule ownership map consumed by `tests/rule-qa.test.ts`.
- `.changeset/concurrency-safety-slice-6.md`: minor-release notes for the package.
- `.git/gh-stack`: local stack relationship metadata created by the GitHub CLI extension; never tracked.

## Task 1: Prepare The Bottom Stack Branch

**Files:** no tracked files. GitHub stack metadata is stored under `.git/gh-stack`.

**Produces:** a clean `concurrency/slice-6-held-state` branch whose parent is `main`.

- [ ] **Step 1: Verify the baseline checkout.** Run:

  ```sh
  git status --short
  git branch --show-current
  git log -1 --oneline
  ```

  Expected: empty status, branch `main`, and the latest committed design is `8808bab Design concurrency safety slice 6 stack` or a descendant containing that commit.

- [ ] **Step 2: Run the baseline focused tests.** Run:

  ```sh
  bun test tests/plugin.test.ts tests/config.test.ts tests/rule-qa.test.ts
  ```

  Expected: the current suite passes before any Slice 6 implementation changes.

- [ ] **Step 3: Install and inspect the stack extension.** Run:

  ```sh
  gh extension install github/gh-stack
  gh stack --help
  gh stack init --help
  gh stack submit --help
  ```

  Expected: `gh stack` is available and the help output includes `init`, `add`, `push`, `submit`, `view`, `sync`, and `merge`.

- [ ] **Step 4: Install the optional agent skill and record its availability.** Run:

  ```sh
  gh skill install github/gh-stack
  ```

  A successful install is useful for future Codex sessions. If the local GitHub CLI reports that `gh skill` is unknown, retain that output in the hand-off and continue; the `gh-stack` extension remains the required workflow dependency.

- [ ] **Step 5: Initialise the bottom branch.** Run:

  ```sh
  gh stack init --base main concurrency/slice-6-held-state
  git branch --show-current
  gh stack view
  ```

  Expected: the checked-out branch is `concurrency/slice-6-held-state`, its parent is `main`, and no tracked files changed. When the extension cannot initialise the branch, run the deterministic fallback `git switch -c concurrency/slice-6-held-state` and continue with ordinary `git push -u origin concurrency/slice-6-held-state` plus `gh pr create --base main` in Task 6.

## Task 2: Add Held-State Rules With Tests First

**Files:**
- Modify: `tests/plugin.test.ts` by adding AST builders and focused tests near the existing concurrency tests.
- Modify: `src/index.ts` by adding helpers, rule implementations, registry entries, and the first strict-rule tuple.
- Modify: `tests/config.test.ts` by adding the two held-state IDs to the concurrency group and recommended exclusion assertions.

**Interfaces:**
- Consumes: existing `isEffectMemberCallNamed`, `isMemberCall`, `containsEffectMemberCallInSet`, `isEffectEcosystemImport`, `report`, `runRuleSequence`, `effectCall`, `callExpression`, `memberAccess`, `arrowCallback`, `numericLiteral`, and `importFrom` helpers.
- Produces: `noYieldWithHeldSemaphorePermit`, `noYieldWithHeldMutableRef`, `strictConcurrencySafetyRuleNames`, and the two corresponding `rules`/`concurrencySafetyRules` entries.

- [ ] **Step 1: Add the minimal AST builders used by the new tests.** Add this helper beside the existing test builders in `tests/plugin.test.ts`:

  ```ts
  const objectMethodCall = (object: unknown, propertyName: string, ...args: unknown[]) => (
    callExpression(memberAccess(object, propertyName), ...args)
  );

  const curriedMethodCall = (
    object: unknown,
    propertyName: string,
    methodArgs: unknown[],
    effect: unknown,
  ) => callExpression(objectMethodCall(object, propertyName, ...methodArgs), effect);
  ```

- [ ] **Step 2: Write failing semaphore-rule tests.** Add tests with these exact shapes:

  ```ts
  it("catches high-risk work inside a held semaphore permit", () => {
    const reports = runRuleSequence("no-yield-with-held-semaphore-permit", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: curriedMethodCall(
          identifier("semaphore"),
          "withPermits",
          [numericLiteral(1)],
          effectCall("sleep", stringLiteral("1 second")),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("suspension while holding a semaphore permit");
  });

  it("allows synchronous work inside a held semaphore permit", () => {
    const reports = runRuleSequence("no-yield-with-held-semaphore-permit", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: curriedMethodCall(
          identifier("semaphore"),
          "withPermits",
          [numericLiteral(1)],
          effectCall("sync", arrowCallback(stringLiteral("ok"))),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches the direct TSemaphore namespace form", () => {
    const reports = runRuleSequence("no-yield-with-held-semaphore-permit", [
      { visitorName: "ImportDeclaration", node: importFrom("effect/TSemaphore") },
      {
        visitorName: "CallExpression",
        node: objectMethodCall(
          identifier("TSemaphore"),
          "withPermit",
          effectCall("await", identifier("deferred")),
          identifier("semaphore"),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
  });
  ```

- [ ] **Step 3: Write failing synchronized-reference tests.** Add tests with these exact shapes:

  ```ts
  it("catches effectful SynchronizedRef modifiers", () => {
    const reports = runRuleSequence("no-yield-with-held-mutable-ref", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: objectMethodCall(
          identifier("SynchronizedRef"),
          "modifyEffect",
          identifier("ref"),
          arrowCallback(effectCall("sleep", stringLiteral("1 second"))),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("suspension while holding synchronized reference coordination");
  });

  it("catches all supported effectful modifier names", () => {
    const modifierNames = ["modifySomeEffect", "updateEffect", "updateAndGetEffect"];

    for (const modifierName of modifierNames) {
      const reports = runRuleSequence("no-yield-with-held-mutable-ref", [
        { visitorName: "ImportDeclaration", node: importFrom("effect") },
        {
          visitorName: "CallExpression",
          node: objectMethodCall(
            identifier("SynchronizedRef"),
            modifierName,
            identifier("ref"),
            arrowCallback(effectCall("forkScoped", identifier("program"))),
          ),
        },
      ]);

      expect(reports).toHaveLength(1);
    }
  });

  it("catches method-style and curried SynchronizedRef modifiers", () => {
    const reports = runRuleSequence("no-yield-with-held-mutable-ref", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: objectMethodCall(
          identifier("ref"),
          "modifyEffect",
          arrowCallback(effectCall("await", identifier("deferred"))),
        ),
      },
      {
        visitorName: "CallExpression",
        node: callExpression(
          objectMethodCall(
            identifier("SynchronizedRef"),
            "updateEffect",
            arrowCallback(effectCall("sleep", stringLiteral("1 second"))),
          ),
          identifier("ref"),
        ),
      },
    ]);

    expect(reports).toHaveLength(2);
  });

  it("allows synchronous reference updates and ordinary Ref methods", () => {
    const reports = runRuleSequence("no-yield-with-held-mutable-ref", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: objectMethodCall(
          identifier("SynchronizedRef"),
          "update",
          identifier("ref"),
          arrowCallback(identifier("value")),
        ),
      },
      {
        visitorName: "CallExpression",
        node: objectMethodCall(
          identifier("ref"),
          "update",
          arrowCallback(identifier("value")),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });
  ```

- [ ] **Step 4: Add the import-gating tests.** For each new rule, call `runRule` without an `ImportDeclaration` visit and assert `expect(reports).toHaveLength(0)`. This locks the existing plugin convention that an unrelated file is not classified from names alone.

- [ ] **Step 5: Run the new tests before implementation.** Run:

  ```sh
  bun test tests/plugin.test.ts
  ```

  Expected: the new tests fail with `Rule no-yield-with-held-semaphore-permit is not exported` or the equivalent missing-rule failure.

- [ ] **Step 6: Add the high-risk suspension helpers.** In `src/index.ts`, add these exact sets and helper responsibilities next to the existing concurrency helpers:

  ```ts
  const highRiskEffectMembers = new Set([
    "sleep",
    "await",
    "promise",
    "tryPromise",
    "fork",
    "forkDaemon",
    "forkScoped",
    "all",
    "forEach",
    "race",
    "raceAll",
  ]);

  const effectfulSynchronizedRefMembers = new Set([
    "modifyEffect",
    "modifySomeEffect",
    "updateEffect",
    "updateAndGetEffect",
  ]);
  ```

  Implement `containsHighRiskSuspension(node, seen)` with the existing parent-safe traversal pattern. It returns `true` for an Effect member in `highRiskEffectMembers`, `Queue.take`, or `Deferred.await`, and recursively inspects nested calls, arrow/function bodies, `Effect.gen` generators, and arrays while skipping `parent`. Use a single `WeakSet<object>` per traversal.

- [ ] **Step 7: Add call-shape helpers.** Implement these structural helpers in `src/index.ts`:
  - `isAnyObjectMemberCallNamed(node, propertyName)`: true only for a non-computed `CallExpression` whose callee is a member expression with the requested property, regardless of the object identifier.
  - `heldSemaphoreWork(node)`: returns the effect/callback argument node for a direct member call `semaphore.withPermit(...)` or `semaphore.withPermits(...)`, a curried outer call `semaphore.withPermits(count)(effect)`, or direct `TSemaphore.withPermit(effect, semaphore)` / `TSemaphore.withPermits(effect, semaphore, count)` syntax. It returns `undefined` for an ordinary member call with no Effect argument.
  - `synchronizedRefModifierWork(node)`: returns the callback/function argument for direct `SynchronizedRef.modifyEffect(ref, callback)`-style calls, the outer application of curried `SynchronizedRef.updateEffect(callback)(ref)`-style calls, or method-style `ref.modifyEffect(callback)` calls. It returns `undefined` for the inner curried partial call, `modify`, `update`, and all ordinary `Ref` method names. The visitor reports only the direct call or outer curried application so one source expression produces one diagnostic.

- [ ] **Step 8: Implement `noYieldWithHeldSemaphorePermit`.** Define an import-gated `CallExpression` visitor. When `heldSemaphoreWork(node)` returns a node and `containsHighRiskSuspension(work)` is true, report the outer held-permit application with this message:

  ```text
  Rule: avoid suspension while holding a semaphore permit. Why: sleeping, awaiting, or forking under a permit holds capacity while unrelated work waits. Fix: narrow the permit-protected section and perform interruptible or concurrent work outside it.
  ```

- [ ] **Step 9: Implement `noYieldWithHeldMutableRef`.** Define an import-gated `CallExpression` visitor. When `synchronizedRefModifierWork(node)` returns a callback and `containsHighRiskSuspension(callback)` is true, report the coordination call with this message:

  ```text
  Rule: avoid suspension while holding synchronized reference coordination. Why: effectful SynchronizedRef modifiers hold internal coordination while the callback sleeps, awaits, or starts concurrent work. Fix: compute the effect outside the modifier and commit a short synchronous state transition.
  ```

- [ ] **Step 10: Register the two rules and classify them.** Add `noYieldWithHeldSemaphorePermit` and `noYieldWithHeldMutableRef` to the `rules` object, append their exact names to `concurrencySafetyRules`, and add:

  ```ts
  const strictConcurrencySafetyRuleNames = [
    "no-yield-with-held-semaphore-permit",
    "no-yield-with-held-mutable-ref",
  ] as const satisfies readonly RuleName[];
  ```

  Combine this tuple with `strictTestingObservabilityAndQaRuleNames` for `recommendedRuleNames` filtering using a `StrictRuleName` union. Keep `testingObservabilityAndQaRules` unchanged.

- [ ] **Step 11: Update the config contract for the first two rules.** Append the two names to `groupExpectations.concurrencySafety` in `tests/config.test.ts` and add explicit negative assertions:

  ```ts
  for (const ruleName of [
    "no-yield-with-held-semaphore-permit",
    "no-yield-with-held-mutable-ref",
  ]) {
    expect(recommended.rules).not.toHaveProperty(`linteffect/${ruleName}`);
  }
  ```

- [ ] **Step 12: Run the focused green test cycle.** Run:

  ```sh
  bun test tests/plugin.test.ts tests/config.test.ts
  ```

  Expected: all new rule tests pass, existing concurrency tests remain green, the group export contains both IDs, and neither ID is in `recommended.rules`.

- [ ] **Step 13: Commit the held-state rules.** Run:

  ```sh
  git add src/index.ts tests/plugin.test.ts tests/config.test.ts
  git commit -m "Add held-state concurrency rules"
  ```

## Task 3: Add The Unscoped Daemon-Fiber Rule With Tests First

**Files:**
- Modify: `tests/plugin.test.ts` with daemon-fiber tests.
- Modify: `src/index.ts` with `noUnscopedBackgroundFiber` and the third strict name.
- Modify: `tests/config.test.ts` with the third group and recommended assertions.

**Interfaces:**
- Consumes: `isEffectMemberCallNamed`, `containsEffectMemberCallNamed`, `isEffectEcosystemImport`, `report`, `runRuleSequence`, `effectCall`, `identifier`, and `importFrom`.
- Produces: `noUnscopedBackgroundFiber`, registered as `linteffect/no-unscoped-background-fiber`.

- [ ] **Step 1: Write failing daemon-fiber tests.** Add these exact tests:

  ```ts
  it("catches direct daemon fibers", () => {
    const reports = runRuleSequence("no-unscoped-background-fiber", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall("forkDaemon", identifier("program")),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("unscoped background fiber");
  });

  it("allows scoped and explicitly supervised fiber forms", () => {
    const reports = runRuleSequence("no-unscoped-background-fiber", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "CallExpression", node: effectCall("forkScoped", identifier("program")) },
      {
        visitorName: "CallExpression",
        node: effectCall("forkIn", identifier("program"), identifier("scope")),
      },
      {
        visitorName: "CallExpression",
        node: effectCall(
          "forkDaemon",
          effectCall("supervised", identifier("program"), identifier("supervisor")),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("leaves ordinary Effect.fork to the existing fork rules", () => {
    const reports = runRuleSequence("no-unscoped-background-fiber", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "CallExpression", node: effectCall("fork", identifier("program")) },
    ]);

    expect(reports).toHaveLength(0);
  });
  ```

- [ ] **Step 2: Run the focused test before implementation.** Run `bun test tests/plugin.test.ts`. Expected: the daemon test fails because `no-unscoped-background-fiber` is not exported.

- [ ] **Step 3: Implement the direct daemon detector.** Add `noUnscopedBackgroundFiber` as an import-gated `CallExpression` visitor. Report only `Effect.forkDaemon(...)` unless its argument contains a direct `Effect.supervised(...)` call. Keep `Effect.forkScoped`, `Effect.forkIn`, and ordinary `Effect.fork` out of this rule. Use this message:

  ```text
  Rule: avoid unscoped background fibers. Why: Effect.forkDaemon detaches work from the caller's scope and can outlive failures and shutdown. Fix: use forkScoped/forkIn or make supervisor ownership explicit in the child effect.
  ```

- [ ] **Step 4: Complete strict classification.** Extend `strictConcurrencySafetyRuleNames` to:

  ```ts
  const strictConcurrencySafetyRuleNames = [
    "no-yield-with-held-semaphore-permit",
    "no-yield-with-held-mutable-ref",
    "no-unscoped-background-fiber",
  ] as const satisfies readonly RuleName[];
  ```

  Add the daemon rule to `rules` and `concurrencySafetyRules`. Do not add it to `recommendedRules` or `testingObservabilityAndQaRules`.

- [ ] **Step 5: Update the public config tests.** Append `no-unscoped-background-fiber` to `groupExpectations.concurrencySafety` and add it to the loop that asserts strict IDs are absent from `recommended.rules`.

- [ ] **Step 6: Run the complete focused unit/config cycle.** Run:

  ```sh
  bun test tests/plugin.test.ts tests/config.test.ts
  ```

  Expected: all three new rules pass their positive/safe tests, the concurrency group contains sixteen IDs, and all three strict IDs are absent from `recommended.rules`.

- [ ] **Step 7: Commit the daemon rule.** Run:

  ```sh
  git add src/index.ts tests/plugin.test.ts tests/config.test.ts
  git commit -m "Add unscoped daemon fiber rule"
  ```

## Task 4: Add Exact CLI Integration And Repository QA Examples

**Files:**
- Create: `tests/fixtures/oxlint/concurrency-safety-slice-6.ts`.
- Create: `tests/fixtures/oxlint/oxlint.concurrency-slice-6.config.ts`.
- Modify: `tests/oxlint.integration.test.ts`.
- Modify: `examples/backend/concurrency-safety-anti-patterns.ts`.

**Interfaces:**
- Consumes: the three registered rule IDs and the existing `runOxlint(fileName, configFileName)` helper.
- Produces: an isolated CLI assertion that reports exactly the three Slice 6 IDs and QA annotations consumed by `tests/rule-qa.test.ts`.

- [ ] **Step 1: Create the focused Oxlint config.** Create `tests/fixtures/oxlint/oxlint.concurrency-slice-6.config.ts` with:

  ```ts
  import { defineConfig } from "oxlint";

  export default defineConfig({
    jsPlugins: [
      {
        name: "linteffect",
        specifier: "../../../src/index.ts",
      },
    ],
    rules: {
      "linteffect/no-yield-with-held-semaphore-permit": "error",
      "linteffect/no-yield-with-held-mutable-ref": "error",
      "linteffect/no-unscoped-background-fiber": "error",
    },
  });
  ```

- [ ] **Step 2: Create the isolated fixture.** Create `tests/fixtures/oxlint/concurrency-safety-slice-6.ts` with one anti-pattern and one safe form for each rule:

  ```ts
  import { Effect, SynchronizedRef, TSemaphore } from "effect";

  declare const semaphore: Effect.Semaphore;
  declare const synchronizedRef: SynchronizedRef.SynchronizedRef<number>;
  declare const tSemaphore: TSemaphore.TSemaphore;
  declare const scope: unknown;
  declare const supervisor: unknown;

  export const heldPermitSleep = semaphore.withPermits(1)(Effect.sleep("1 second"));
  export const safePermitSync = semaphore.withPermits(1)(Effect.sync(() => "ok"));
  export const heldRefSleep = SynchronizedRef.modifyEffect(
    synchronizedRef,
    () => Effect.sleep("1 second").pipe(Effect.as([0, 0] as const)),
  );
  export const safeRefUpdate = SynchronizedRef.update(synchronizedRef, (value) => value + 1);
  export const heldTsyncAwait = TSemaphore.withPermit(
    Effect.await("deferred"),
    tSemaphore,
  );
  export const daemonWorker = Effect.forkDaemon(Effect.sync(() => "daemon"));
  export const supervisedDaemon = Effect.forkDaemon(
    Effect.supervised(Effect.sync(() => "supervised"), supervisor),
  );
  export const scopedWorker = Effect.forkScoped(Effect.sync(() => "scoped"));
  export const inScopeWorker = Effect.forkIn(Effect.sync(() => "in-scope"), scope);
  ```

  The fixture intentionally has three offending calls: `heldPermitSleep`, `heldRefSleep`, and `daemonWorker`. The direct `TSemaphore` form is an additional held-permit positive and therefore the integration assertion must expect two semaphore diagnostics while still expecting one diagnostic for each of the other rules.

- [ ] **Step 3: Add the exact CLI assertion.** Add this test to `tests/oxlint.integration.test.ts`:

  ```ts
  it("reports exactly the Slice 6 concurrency safety diagnostics", () => {
    const result = runOxlint(
      "concurrency-safety-slice-6.ts",
      "oxlint.concurrency-slice-6.config.ts",
    );
    const ruleIds = [...result.output.matchAll(/linteffect\\(([^)]+)\\)/g)]
      .map((match) => match[1])
      .sort();

    expect(result.status).toBe(1);
    expect(ruleIds).toEqual([
      "no-unscoped-background-fiber",
      "no-yield-with-held-mutable-ref",
      "no-yield-with-held-semaphore-permit",
      "no-yield-with-held-semaphore-permit",
    ]);
  });
  ```

- [ ] **Step 4: Run the focused CLI test before modifying the repository example.** Run `bun test tests/oxlint.integration.test.ts`. Expected: the new test fails until the fixture and rule implementation are present, then passes with exactly four diagnostics and no unrelated rule IDs.

- [ ] **Step 5: Add the three annotated anti-patterns to the backend QA file.** Modify `examples/backend/concurrency-safety-anti-patterns.ts` with these imports/declarations and snippets, leaving the anti-pattern statements unchanged:

  ```ts
  import { Effect, Queue, SynchronizedRef } from "effect";

  declare const semaphore: Effect.Semaphore;
  declare const synchronizedRef: SynchronizedRef.SynchronizedRef<number>;
  declare const scope: unknown;
  declare const supervisor: unknown;

  // EXPECT: linteffect/no-yield-with-held-semaphore-permit
  // QA: A permit should protect a short synchronous state transition, not a sleeping effect.
  export const permitHeldAcrossSleep = semaphore.withPermit(Effect.sleep("1 second"));

  // EXPECT: linteffect/no-yield-with-held-mutable-ref
  // QA: SynchronizedRef effect modifiers should not hold coordination while starting concurrent work.
  export const synchronizedRefHeldAcrossFork = SynchronizedRef.modifyEffect(
    synchronizedRef,
    () => Effect.forkScoped(Effect.sync(() => "work")).pipe(Effect.as([0, 0] as const)),
  );

  // EXPECT: linteffect/no-unscoped-background-fiber
  // QA: Daemon fibers detach from the caller's scope and need explicit ownership.
  export const unscopedDaemonWorker = Effect.forkDaemon(Effect.sync(() => "daemon"));

  export const safePermitCriticalSection = semaphore.withPermit(Effect.sync(() => "ok"));
  export const safeSynchronizedRefUpdate = SynchronizedRef.update(
    synchronizedRef,
    (value) => value + 1,
  );
  export const safeScopedWorker = Effect.forkScoped(Effect.sync(() => "scoped"));
  export const safeInWorker = Effect.forkIn(Effect.sync(() => "in-scope"), scope);
  export const supervisedDaemonWorker = Effect.forkDaemon(
    Effect.supervised(Effect.sync(() => "supervised"), supervisor),
  );
  ```

  Preserve all existing imports, declarations, and annotations in that file. The new safe variants must not receive `EXPECT` comments.

- [ ] **Step 6: Run the example QA feedback loop.** Run:

  ```sh
  bun run lint:examples > /tmp/linteffect-observed.log 2>&1 || true
  rg -o "EXPECT: linteffect/[a-zA-Z0-9-]+" examples \
    | sed "s/.*EXPECT: //" \
    | sort -u > /tmp/linteffect-expected.txt
  rg -o "linteffect\\([^)]+\\)" /tmp/linteffect-observed.log \
    | sed "s/linteffect(/linteffect\\//; s/)//" \
    | sort -u > /tmp/linteffect-observed.txt
  comm -23 /tmp/linteffect-expected.txt /tmp/linteffect-observed.txt
  ```

  Expected: `bun run lint:examples` exits non-zero because the corpus is intentionally invalid, and the final `comm` command prints no lines.

## Task 5: Align README, Roadmap, And Rule Inventory

**Files:**
- Modify: `README.md` in the Concurrency Safety table.
- Modify: `roadmap/02-concurrency-safety/README.md` in the expansion backlog and Slice 6 checklist.
- Modify: `docs/rule-qa-inventory.json` with three completed roadmap owners.
- Modify: `tests/rule-qa.test.ts` only if a current contract assertion needs the new exact table/annotation shape; do not weaken its checks.

**Interfaces:**
- Consumes: the exact rule names exported by `plugin.rules` and the `EXPECT` annotations from Task 4.
- Produces: README, roadmap, and inventory agreement enforced by `bun test tests/rule-qa.test.ts`.

- [ ] **Step 1: Add the README rows.** Add these rows in the existing Concurrency Safety table after `no-global-mutable-concurrency-state`:

  ```md
  | `linteffect/no-yield-with-held-semaphore-permit` | Direct semaphore `withPermit` / `withPermits` work whose effect contains sleep, await, Promise interop, queue waiting, or concurrent Effect work. | Strict-only protection against holding a permit while interruptible or concurrent work occupies the critical section. |
  | `linteffect/no-yield-with-held-mutable-ref` | Effectful `SynchronizedRef` modifiers (`modifyEffect`, `modifySomeEffect`, `updateEffect`, `updateAndGetEffect`) whose callback suspends or starts concurrent work. | Strict-only protection that keeps internal reference coordination short and synchronous. |
  | `linteffect/no-unscoped-background-fiber` | Direct `Effect.forkDaemon(...)` without a direct `Effect.supervised(...)` child-effect marker. | Strict-only protection that requires daemon work to expose supervision or use scoped ownership instead of silently outliving the caller. |
  ```

- [ ] **Step 2: Mark the roadmap rows complete.** Change the three expansion-backlog rows and the three Slice 6 checklist rows in `roadmap/02-concurrency-safety/README.md` from `[ ]` to `[x]`. Leave `no-manual-deferred-coordination` and `no-acquire-without-scoped-release` unchecked in Slice 7.

- [ ] **Step 3: Add the inventory owners.** Add these exact JSON properties to `docs/rule-qa-inventory.json`, preserving the file's two-space formatting and sorted rule-key convention:

  ```json
  "no-unscoped-background-fiber": "roadmap/02-concurrency-safety/README.md",
  "no-yield-with-held-mutable-ref": "roadmap/02-concurrency-safety/README.md",
  "no-yield-with-held-semaphore-permit": "roadmap/02-concurrency-safety/README.md"
  ```

- [ ] **Step 4: Run the QA contract.** Run:

  ```sh
  bun test tests/rule-qa.test.ts
  ```

  Expected: every exported rule has exactly one inventory key, one README table entry, one `EXPECT` annotation, and a completed roadmap row for the three new rules.

- [ ] **Step 5: Run the combined focused checks.** Run:

  ```sh
  bun test tests/config.test.ts tests/oxlint.integration.test.ts tests/rule-qa.test.ts
  git diff --check
  ```

- [ ] **Step 6: Commit the public QA surfaces.** Run:

  ```sh
  git add src/index.ts tests/config.test.ts tests/oxlint.integration.test.ts \
    tests/fixtures/oxlint examples/backend/concurrency-safety-anti-patterns.ts \
    README.md roadmap/02-concurrency-safety/README.md docs/rule-qa-inventory.json
  git commit -m "Document concurrency safety slice 6"
  ```

## Task 6: Add Release Metadata And Run Package Gates

**Files:**
- Create: `.changeset/concurrency-safety-slice-6.md`.

**Interfaces:**
- Consumes: the three completed strict rules and their README/roadmap classification.
- Produces: a minor Changeset ready to travel with the Slice 6 PR; no version bump or publication occurs in this slice.

- [ ] **Step 1: Create the Changeset.** Create `.changeset/concurrency-safety-slice-6.md` with:

  ```md
  ---
  "@opsydyn/oxlint-effect": minor
  ---

  Add strict concurrency-safety diagnostics for suspension inside semaphore permits, effectful SynchronizedRef modifiers, and unscoped daemon fibers. The rules use conservative direct-call syntax detection and keep custom abstractions outside their analysis scope.
  ```

- [ ] **Step 2: Run the full test and package gates sequentially.** Run:

  ```sh
  bun test
  bun run typecheck
  bun run docs:api:check
  bun run build
  bun run lint
  bun run size
  bun run pack:dry-run
  git diff --check
  git status --short
  ```

  Expected: every command exits zero, except no command in this package gate intentionally runs `lint:examples`; the example corpus remains a warning-producing QA fixture. Confirm `npm pack --dry-run` lists only the package's intended published files and the built declarations include the updated rule exports.

- [ ] **Step 3: Commit the Changeset.** Run:

  ```sh
  git add .changeset/concurrency-safety-slice-6.md
  git commit -m "Prepare concurrency safety slice 6 release"
  ```

## Task 7: Push And Submit The Stacked Pull Request

**Files:** no additional tracked files. Remote branches and PR metadata are external state.

**Interfaces:**
- Consumes: the clean `concurrency/slice-6-held-state` branch and the local `.git/gh-stack` relationship.
- Produces: one reviewable bottom PR targeting `main`; no empty child PRs.

- [ ] **Step 1: Push the bottom branch through the stack extension.** Run:

  ```sh
  gh stack push
  ```

  Expected: `concurrency/slice-6-held-state` is present on `origin` with all Slice 6 commits.

- [ ] **Step 2: Submit the bottom PR.** Run:

  ```sh
  gh stack submit --auto --open
  ```

  Expected: the extension creates or updates the Slice 6 PR with `main` as its base. If the installed extension rejects the combined flags, run `gh stack submit --auto` and inspect the generated URL from the command output before opening the PR manually.

- [ ] **Step 3: Verify the stack and PR relationship.** Run:

  ```sh
  gh stack view
  gh pr list --head concurrency/slice-6-held-state --json number,baseRefName,headRefName,isDraft,statusCheckRollup,url
  ```

  Expected: one PR has `headRefName` `concurrency/slice-6-held-state`, `baseRefName` `main`, and the expected check rollup. Do not create `concurrency/slice-7-coordination` or a resource-acquisition child branch until those slices have approved semantics and their own implementation plans.

- [ ] **Step 4: Record the next-child command without executing it.** The next approved child slice will be created with:

  ```sh
  gh stack add concurrency/slice-7-coordination
  ```

  This makes the child branch target `concurrency/slice-6-held-state`; it is intentionally a hand-off instruction, not an empty branch creation in the current slice.

- [ ] **Step 5: Stop at the review boundary.** Do not run `changeset version`, `changeset publish`, merge the PR, or alter `main` in this slice. Release publication remains a separate approval after review and CI checks.

## Verification Checklist

- [ ] Three new rules have focused positive and safe-variant unit coverage.
- [ ] `concurrencySafetyRules` contains all Slice 6 rules; `recommendedRules` excludes them.
- [ ] The isolated Oxlint CLI fixture reports exactly two held-semaphore diagnostics, one held-reference diagnostic, and one daemon-fiber diagnostic.
- [ ] Each new rule has a backend anti-pattern example with `EXPECT` and `QA` annotations plus safe variants.
- [ ] README, roadmap, and `docs/rule-qa-inventory.json` agree; `tests/rule-qa.test.ts` passes.
- [ ] Full package gates pass, while the example lint command intentionally reports diagnostics and the expected-versus-observed gap is empty.
- [ ] The bottom branch is pushed and its PR targets `main`; future child branches are not fabricated before their designs are approved.
