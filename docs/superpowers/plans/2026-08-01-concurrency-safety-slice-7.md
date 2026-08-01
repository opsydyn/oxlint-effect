# Concurrency Safety Slice 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `no-manual-deferred-coordination` and
`no-acquire-without-scoped-release`, expose them through the existing
`concurrencySafety` group with the approved strict/runtime preset split, and
validate both rules through unit tests, CLI fixtures, annotated examples,
documentation, QA inventory, and release gates.

**Architecture:** Keep the plugin's current single-file AST architecture in
`src/index.ts`. Add small structural helpers for local Deferred bindings,
bounded/owned await shapes, resource-like acquisition names, concurrent Effect
work roots, and lexical release evidence. The rules remain import-gated and
type-free: they do not resolve TypeScript symbols, infer arbitrary resource
types, follow aliases across functions, or prove ownership for custom
abstractions.

**Tech Stack:** Bun, TypeScript, `@oxlint/plugins`, Oxlint CLI, Bun test,
Changesets, GitHub CLI, and the `github/gh-stack` extension when available.

## Global Constraints

- Use TDD for both rules: add focused failing tests, run them to observe the missing-rule failure, implement the smallest detector, then run the focused tests to prove the green state.
- Preserve existing rule behaviour and exports. Do not change existing diagnostic messages, default rule IDs, or unrelated preset membership.
- `no-manual-deferred-coordination` is strict-only: add it to `concurrencySafety`, exclude it from `recommended`, and include it in the strict concurrency filter.
- `no-acquire-without-scoped-release` is a runtime rule: add it to `concurrencySafety` and leave it in `recommended` under the current non-strict rule filtering convention.
- Keep detection direct and structural. Do not add a type checker, symbol resolver, whole-program ownership analysis, configurable custom-resource registry, or project-wide alias analysis.
- Use the existing `isEffectEcosystemImport` gate for both rules. Files without an Effect ecosystem import must produce no diagnostics.
- Report one diagnostic per offending await or acquisition call. Deduplicate an acquisition if the same AST node is encountered through nested concurrent roots.
- Keep annotated examples intentionally lint-invalid. Safe variants must remain in the same example file and must not receive the new rule IDs.
- Use `bun` for project commands. Run build-dependent gates sequentially because the build cleans shared output.
- Keep `.git/gh-stack` local metadata untracked. Do not edit or commit generated `dist` output.
- Do not implement the remaining Resource Lifetime roadmap rules in this slice.

---

## File Map

- `src/index.ts`: Deferred and acquisition AST helpers, two rule implementations, registry entries, strict filtering, and the concurrency group export.
- `tests/plugin.test.ts`: direct visitor tests using the existing hand-built ESTree helpers.
- `tests/config.test.ts`: group membership, strict exclusion, recommended inclusion, and public preset assertions.
- `tests/fixtures/oxlint/concurrency-safety-slice-7.ts`: isolated invalid and valid CLI fixture.
- `tests/fixtures/oxlint/oxlint.concurrency-slice-7.config.ts`: focused Oxlint config enabling exactly the two Slice 7 rules.
- `tests/oxlint.integration.test.ts`: exact CLI diagnostic ID/count assertion for the focused fixture.
- `examples/backend/concurrency-safety-anti-patterns.ts`: annotated Deferred and acquisition anti-patterns plus safe variants.
- `README.md`: user-facing Concurrency Safety rule entries and explanations.
- `roadmap/02-concurrency-safety/README.md`: expansion backlog, Slice 7 checklist, detection notes, and safe variants.
- `docs/rule-qa-inventory.json`: exported-rule ownership map.
- `.changeset/concurrency-safety-slice-7.md`: minor release note.
- `.git/gh-stack`: local stack metadata only, never tracked.

## Task 1: Prepare The Slice Branch And Baseline

**Files:** No tracked files. Git stack metadata is local under `.git/gh-stack`.

**Produces:** A clean `concurrency/slice-7-coordination` branch based on the
updated `main` containing the committed design spec.

- [ ] **Step 1: Verify the baseline.** Run:

  ```sh
  git status --short --branch
  git branch --show-current
  git log -3 --oneline --decorate
  ```

  Expected: clean `main`, with `8721561 Design concurrency safety slice 7`
  present at `HEAD` or in its ancestry.

- [ ] **Step 2: Run the baseline focused checks.** Run:

  ```sh
  bun test tests/plugin.test.ts tests/config.test.ts tests/rule-qa.test.ts
  bun run typecheck
  ```

  Expected: both commands pass before Slice 7 code changes.

- [ ] **Step 3: Initialise the stacked branch if the extension is available.**
  Run:

  ```sh
  gh stack --help
  gh stack init --base main concurrency/slice-7-coordination
  git branch --show-current
  gh stack view
  ```

  Expected: the checked-out branch is `concurrency/slice-7-coordination`, its
  parent is `main`, and no tracked files changed. If `gh stack` is unavailable,
  use:

  ```sh
  git switch -c concurrency/slice-7-coordination
  git branch --show-current
  ```

  Continue with ordinary `git push -u origin` and `gh pr create --base main` in
  Task 8 if the extension cannot be used.

## Task 2: Add The Deferred Rule With Red-Green Unit Coverage

**Files:**
- Modify: `tests/plugin.test.ts` near the existing Slice 6 concurrency tests.
- Modify: `src/index.ts` in the helper section near `containsHighRiskSuspension` and in the rule registry section near `noUnscopedBackgroundFiber`.

**Interfaces:**
- Consumes: `isIdentifier`, `isAnyObjectMemberCallNamed`, `isEffectMemberCallNamed`, `isEffectEcosystemImport`, `report`, `runRuleSequence`, `objectMethodCall`, `effectCall`, `yieldExpression`, `variableDeclaratorWithInit`, `blockStatement`, and `generatorCallback`.
- Produces: `isDeferredConstructorCall`, `isDeferredAwaitCall`, `deferredBindingName`, `isDeferredAwaitProtected`, `noManualDeferredCoordination`, and the rule registry entry.

- [ ] **Step 1: Add focused AST helper builders for the tests.** Add these
  builders beside the existing `objectMethodCall` and Effect helpers in
  `tests/plugin.test.ts`:

  ```ts
  const deferredCall = (method: string, ...args: unknown[]) => (
    objectMethodCall(identifier("Deferred"), method, ...args)
  );

  const deferredBinding = (name: string, method = "make") => (
    variableDeclaratorWithInit(name, yieldExpression(deferredCall(method)))
  );

  const deferredAwait = (name: string) => deferredCall("await", identifier(name));
  ```

- [ ] **Step 2: Write the failing local-latch tests.** Add tests with these
  exact behaviours:

  ```ts
  it("reports an unbounded await of a locally created Deferred", () => {
    const reports = runRuleSequence("no-manual-deferred-coordination", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "VariableDeclarator", node: deferredBinding("ready") },
      { visitorName: "CallExpression", node: deferredAwait("ready") },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("manual Deferred coordination");
  });

  it("reports both supported unsafe Deferred constructor spellings", () => {
    for (const method of ["unsafeMake", "makeUnsafe"]) {
      const reports = runRuleSequence("no-manual-deferred-coordination", [
        { visitorName: "ImportDeclaration", node: importFrom("effect") },
        { visitorName: "VariableDeclarator", node: deferredBinding("ready", method) },
        { visitorName: "CallExpression", node: deferredAwait("ready") },
      ]);

      expect(reports).toHaveLength(1);
    }
  });
  ```

- [ ] **Step 3: Write the failing bounded and owned-variant tests.** Add
  cases where the same await is nested in each supported safety marker:

  ```ts
  const protectedAwaitCases = [
    effectCall("timeout", deferredAwait("ready"), stringLiteral("1 second")),
    effectCall("timeoutOption", deferredAwait("ready"), stringLiteral("1 second")),
    effectCall("timeoutFail", deferredAwait("ready"), stringLiteral("1 second")),
    effectCall("timeoutFailCause", deferredAwait("ready"), stringLiteral("1 second")),
    effectCall("timeoutTo", deferredAwait("ready"), stringLiteral("1 second")),
    effectCall("race", deferredAwait("ready"), effectCall("sleep", stringLiteral("1 second"))),
    effectCall("raceFirst", deferredAwait("ready"), effectCall("sleep", stringLiteral("1 second"))),
    effectCall("interruptible", deferredAwait("ready")),
    effectCall("scoped", deferredAwait("ready")),
  ];
  ```

  For each case, visit the import, `deferredBinding("ready")`, and the outer
  protected call. Expect zero reports. Add a finalizer test with a generator
  body containing:

  ```ts
  effectCall("addFinalizer", arrowCallback(deferredCall("succeed", identifier("ready"))));
  deferredAwait("ready");
  ```

  The finalizer callback must reference `ready`, and the test must expect zero
  reports.

- [ ] **Step 4: Write the failing boundary and import-gating tests.** Cover
  these exact negatives:

  - `Deferred.await(other)` after a binding named `ready` exists;
  - an await in a separate function scope from the constructor binding;
  - `Deferred.await(ready)` without an Effect ecosystem import;
  - two unprotected awaits of `ready`, which must produce exactly two reports,
    not one report for the constructor.

- [ ] **Step 5: Run the focused tests and verify the red state.** Run:

  ```sh
  bun test tests/plugin.test.ts -t "Deferred"
  ```

  Expected: FAIL because `no-manual-deferred-coordination` is not registered
  yet. Do not weaken the assertions to make the test pass without the rule.

- [ ] **Step 6: Implement the Deferred helpers.** In `src/index.ts`, add:

  ```ts
  const deferredConstructorMembers = new Set(["make", "unsafeMake", "makeUnsafe"]);
  const deferredTimeoutMembers = new Set([
    "timeout",
    "timeoutOption",
    "timeoutFail",
    "timeoutFailCause",
    "timeoutTo",
  ]);

  function isDeferredConstructorCall(node: unknown): boolean;
  function isDeferredAwaitCall(node: unknown): node is Node & { arguments: unknown[] };
  function deferredBindingName(node: unknown): string | undefined;
  function isDeferredAwaitProtected(node: unknown, bindingName: string): boolean;
  ```

  `isDeferredConstructorCall` must accept only a non-computed member call whose
  object is `Deferred` and whose property is in the constructor set.
  `deferredBindingName` must accept a `VariableDeclarator` with an identifier
  and an initializer containing one direct constructor call, including the
  `YieldExpression` generator form. Do not accept object properties or
  destructuring aliases.

  `isDeferredAwaitProtected` must inspect the await's direct enclosing shape
  and the current local effect body. It must recognise the timeout set, race
  and raceFirst/raceAll boundaries, `Effect.interruptible`, `Effect.scoped`,
  pipe-style `Effect.scoped`, and a matching `Effect.addFinalizer` or
  `Scope.addFinalizer` callback that references the same binding. It must skip
  the `parent` property during recursive traversal and use a `WeakSet` for
  cycle protection.

- [ ] **Step 7: Implement and register the rule.** Add `noManualDeferredCoordination`
  with this visitor contract:

  ```ts
  const noManualDeferredCoordination = defineRule({
    create(context: OxlintContext) {
      let hasEffectEcosystemImport = false;
      const deferredBindings = new Set<string>();

      return {
        ImportDeclaration(node: any) { /* set the import gate */ },
        VariableDeclarator(node: any) { /* record deferredBindingName(node) */ },
        CallExpression(node: any) { /* report an unprotected matching await */ },
      };
    },
  });
  ```

  Keep binding state local to the rule context. Use the existing function-scope
  visitor conventions to clear or isolate bindings when entering and leaving a
  function-like scope. Report this exact message shape at the await node:

  ```text
  Rule: avoid unbounded manual Deferred coordination. Why: a local latch can wait forever and make shutdown or failure ownership implicit. Fix: bound the await with a timeout/race, keep it interruptible, or tie completion and cleanup to a scope finalizer.
  ```

  Add the implementation to the internal `rules` object as
  `"no-manual-deferred-coordination": noManualDeferredCoordination`. Do not
  add it to `concurrencySafetyRules` or the strict tuple until Task 4.

- [ ] **Step 8: Run the focused tests and commit the green rule.** Run:

  ```sh
  bun test tests/plugin.test.ts -t "Deferred"
  bun run typecheck
  ```

  Expected: all Deferred tests pass and TypeScript reports no errors. Commit:

  ```sh
  git add src/index.ts tests/plugin.test.ts
  git commit -m "Add manual Deferred coordination rule"
  ```

## Task 3: Add The Acquisition Rule With Red-Green Unit Coverage

**Files:**
- Modify: `tests/plugin.test.ts` after the Deferred tests.
- Modify: `src/index.ts` beside the Deferred/concurrency helper section and near the new rule implementation.

**Interfaces:**
- Consumes: `isEffectMemberCallNamed`, `isAnyObjectMemberCallNamed`, `containsEffectMemberCallInSet`, `concurrentEffectWorkNode`, `report`, `runRuleSequence`, `effectCall`, `objectMethodCall`, `arrayLiteral`, `arrowCallback`, `stringLiteral`, and `variableDeclaratorWithInit`.
- Produces: `resourceAcquisitionVerbs`, `resourceLikeTerms`, `concurrentWorkArguments`, `resourceAcquisitionCall`, `hasScopedReleaseEvidence`, `noAcquireWithoutScopedRelease`, and the rule registry entry.

- [ ] **Step 1: Add acquisition test builders.** Add these builders beside
  the Deferred builders:

  ```ts
  const namedCall = (name: string, ...args: unknown[]) => (
    callExpression(identifier(name), ...args)
  );

  const resourceAcquire = (name: string) => namedCall(name, stringLiteral("primary"));

  const concurrentWork = (propertyName: string, ...args: unknown[]) => (
    effectCall(propertyName, ...args)
  );
  ```

- [ ] **Step 2: Write the failing acquisition positives.** Add tests for
  these exact calls, with an Effect import and one expected diagnostic each:

  ```ts
  const positiveCases = [
    concurrentWork("fork", resourceAcquire("openConnection")),
    concurrentWork("forkScoped", resourceAcquire("createClient")),
    concurrentWork("forkDaemon", resourceAcquire("connectToDatabase")),
    concurrentWork("all", arrayLiteral(resourceAcquire("openFile"))),
    concurrentWork("forEach", identifier("items"), arrowCallback(resourceAcquire("acquireHandle"))),
    concurrentWork("race", resourceAcquire("listenServer"), identifier("fallback")),
    concurrentWork("raceFirst", resourceAcquire("subscribeStream"), identifier("fallback")),
    concurrentWork("raceAll", arrayLiteral(resourceAcquire("openSocket"))),
    concurrentWork("fork", effectCall("promise", arrowCallback(resourceAcquire("openConnection")))),
  ];
  ```

  Assert that every report message contains `scoped release` and that the rule
  reports the acquisition call node rather than the outer Effect call.

- [ ] **Step 3: Write the failing acquisition safe-variant tests.** Add zero
  report cases for:

  ```ts
  effectCall(
    "fork",
    effectCall(
      "acquireRelease",
      resourceAcquire("openConnection"),
      arrowCallback(effectCall("succeed", identifier("closed"))),
    ),
  );

  effectCall("fork", effectCall("acquireUseRelease", resourceAcquire("createClient"), identifier("use"), identifier("release")));
  effectCall("fork", effectCall("scoped", resourceAcquire("openFile")));
  methodPipeCall(resourceAcquire("openSocket"), memberAccess(identifier("Effect"), "scoped"));
  ```

  Add a generator-body finalizer case where `const connection = yield* openConnection()`
  is followed by `Effect.addFinalizer(() => connection.close())` and the
  connection is used inside a forked effect. The test must expect zero reports.

  Also add zero report cases for `makeClient()` inside `Effect.fork`,
  `client.connect()` inside `Effect.fork`, and `openConnection()` outside a
  concurrent Effect boundary.

- [ ] **Step 4: Write the failing import and deduplication tests.** Assert no
  reports without an Effect ecosystem import. Build a nested concurrent AST in
  which one `openConnection()` node is contained by both an inner `Effect.fork`
  and an outer `Effect.all`, visit both roots, and assert exactly one report.

- [ ] **Step 5: Run the focused tests and verify the red state.** Run:

  ```sh
  bun test tests/plugin.test.ts -t "scoped release"
  ```

  Expected: FAIL because `no-acquire-without-scoped-release` is not registered.

- [ ] **Step 6: Implement acquisition helpers.** Add these exact constants and
  helper contracts in `src/index.ts`:

  ```ts
  const resourceAcquisitionVerbs = new Set([
    "open", "connect", "create", "start", "listen", "subscribe", "acquire",
  ]);

  const resourceLikeTerms = new Set([
    "client", "connection", "conn", "pool", "db", "database", "file",
    "socket", "stream", "server", "subscription", "handle",
  ]);

  function concurrentWorkArguments(node: unknown): unknown[] | undefined;
  function resourceAcquisitionCall(node: unknown): node is Node & { callee: Node };
  function hasScopedReleaseEvidence(node: unknown, bindingName?: string): boolean;
  function findUnscopedResourceAcquisition(node: unknown, seen?: WeakSet<object>): unknown | undefined;
  ```

  `concurrentWorkArguments` must return the arguments of direct Effect calls
  named `fork`, `forkScoped`, `forkDaemon`, `all`, `forEach`, `race`,
  `raceFirst`, and `raceAll`; return `undefined` for every other call.

  `resourceAcquisitionCall` must inspect the callee's identifier or non-
  computed member property, split its lower-cased name into the two required
  vocabulary conditions, and reject generic `make` and arbitrary names. The
  helper must not classify an `Effect.acquireRelease` call itself as a resource
  acquisition.

  `hasScopedReleaseEvidence` must recognise direct `Effect.acquireRelease` and
  `Effect.acquireUseRelease` ownership, direct and pipe-style `Effect.scoped`,
  and `Effect.addFinalizer`/`Scope.addFinalizer` callbacks that reference the
  same local binding. It must not treat an unrelated finalizer sibling as
  evidence.

  `findUnscopedResourceAcquisition` must recurse through the work arguments,
  skip `parent`, stop at a recognised ownership boundary, and return the first
  unowned acquisition node. Use a `WeakSet` to avoid cycles.

- [ ] **Step 7: Implement and register the rule.** Add this visitor shape:

  ```ts
  const noAcquireWithoutScopedRelease = defineRule({
    create(context: OxlintContext) {
      let hasEffectEcosystemImport = false;
      const reported = new WeakSet<object>();

      return {
        ImportDeclaration(node: any) { /* set the import gate */ },
        CallExpression(node: any) {
          /* find the first unowned acquisition in concurrentWorkArguments(node) */
          /* report once per acquisition node */
        },
      };
    },
  });
  ```

  Report this exact message shape at the acquisition node:

  ```text
  Rule: avoid resource acquisition without scoped release. Why: acquiring a client, connection, file, or handle inside concurrent work can outlive failures and interruption. Fix: wrap acquisition in acquireRelease/acquireUseRelease, use Effect.scoped, or register a matching finalizer.
  ```

  Add the implementation to the internal `rules` object as
  `"no-acquire-without-scoped-release": noAcquireWithoutScopedRelease`. Do not
  add it to `concurrencySafetyRules` until Task 4.

- [ ] **Step 8: Run the focused tests and commit the green rule.** Run:

  ```sh
  bun test tests/plugin.test.ts -t "scoped release"
  bun run typecheck
  ```

  Expected: all acquisition tests pass and TypeScript reports no errors. Commit:

  ```sh
  git add src/index.ts tests/plugin.test.ts
  git commit -m "Add scoped release acquisition rule"
  ```

## Task 4: Complete The Public Config Surface

**Files:**
- Modify: `src/index.ts` rule registry, strict tuple, and concurrency group.
- Modify: `tests/config.test.ts` group expectations and recommended assertions.

**Interfaces:**
- Consumes: `noManualDeferredCoordination`, `noAcquireWithoutScopedRelease`, and the existing `rulesFromNames`/`recommendedRules` filtering.
- Produces: stable public entries in `plugin.rules`, `allRules`, `concurrencySafetyRules`, `concurrencySafety`, `recommendedRules`, and `recommended`.

- [ ] **Step 1: Add the two IDs to a failing config expectation.** Append the
  exact IDs to `groupExpectations.concurrencySafety` in
  `tests/config.test.ts`. Extend the recommended test to assert:

  ```ts
  expect(recommended.rules).not.toHaveProperty(
    "linteffect/no-manual-deferred-coordination",
  );
  expect(recommended.rules).toHaveProperty(
    "linteffect/no-acquire-without-scoped-release",
    "error",
  );
  ```

  Update the expected complete `recommended.rules` object in the same test so
  it contains the acquisition rule exactly once and does not contain the
  Deferred rule.

- [ ] **Step 2: Run the config tests to observe the red state.** Run:

  ```sh
  bun test tests/config.test.ts
  ```

  Expected: FAIL because the registry and group exports do not contain both
  new IDs yet.

- [ ] **Step 3: Complete the group membership and classify the strict rule.**
  The individual rule tasks have already added both implementations to the
  `rules` registry. In `src/index.ts`:

  - add both IDs to `concurrencySafetyRules` after the Slice 6 IDs;
  - add `no-manual-deferred-coordination` to `strictConcurrencySafetyRuleNames`;
  - leave `no-acquire-without-scoped-release` outside the strict tuple;
  - do not alter any existing group or recommended rule.

- [ ] **Step 4: Run config and plugin tests, then commit.** Run:

  ```sh
  bun test tests/config.test.ts tests/plugin.test.ts
  bun run typecheck
  ```

  Expected: both suites pass. Commit:

  ```sh
  git add src/index.ts tests/config.test.ts
  git commit -m "Expose concurrency slice 7 rule presets"
  ```

## Task 5: Add The Isolated Oxlint Fixture And CLI Contract

**Files:**
- Create: `tests/fixtures/oxlint/concurrency-safety-slice-7.ts`.
- Create: `tests/fixtures/oxlint/oxlint.concurrency-slice-7.config.ts`.
- Modify: `tests/oxlint.integration.test.ts`.

**Interfaces:**
- Consumes: the two registered `linteffect/*` rules and the existing `runOxlint` helper.
- Produces: an exact CLI diagnostic contract independent of the invalid example corpus.

- [ ] **Step 1: Add the focused config.** Create:

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
      "linteffect/no-manual-deferred-coordination": "error",
      "linteffect/no-acquire-without-scoped-release": "error",
    },
  });
  ```

- [ ] **Step 2: Add invalid and valid fixture cases.** The fixture must
  contain exactly these invalid diagnostics:

  ```ts
  import { Deferred, Effect } from "effect";

  export const unboundedReadyLatch = Effect.gen(function* () {
    const ready = yield* Deferred.make<void>();
    return yield* Deferred.await(ready);
  });

  export const unscopedConnectionWorker = Effect.fork(openConnection());
  export const unscopedClientFanout = Effect.all([
    Effect.promise(() => createClient()),
  ]);
  ```

  Add safe cases using `Effect.timeout(Deferred.await(...))`,
  `Effect.scoped(openConnection())`, and
  `Effect.acquireRelease(createClient(), releaseClient)`; these must not add
  diagnostics. Declare each fixture helper with an explicit Effect-shaped type
  so the file remains parseable and typecheck-friendly without executing it.

- [ ] **Step 3: Add the exact integration assertion.** Add a test beside the
  Slice 6 integration test:

  ```ts
  it("reports exactly the Slice 7 concurrency safety diagnostics", () => {
    const result = runOxlint(
      "concurrency-safety-slice-7.ts",
      "oxlint.concurrency-slice-7.config.ts",
    );
    const ruleIds = [...result.output.matchAll(/linteffect\\(([^)]+)\\)/g)]
      .map((match) => match[1])
      .sort();

    expect(result.status).toBe(1);
    expect(ruleIds).toEqual([
      "no-acquire-without-scoped-release",
      "no-acquire-without-scoped-release",
      "no-manual-deferred-coordination",
    ]);
  });
  ```

- [ ] **Step 4: Run the CLI contract and commit.** Run:

  ```sh
  bun test tests/oxlint.integration.test.ts -t "Slice 7"
  ```

  Expected: the focused test passes with exactly three diagnostics. Commit:

  ```sh
  git add tests/fixtures/oxlint/concurrency-safety-slice-7.ts tests/fixtures/oxlint/oxlint.concurrency-slice-7.config.ts tests/oxlint.integration.test.ts
  git commit -m "Add concurrency slice 7 CLI fixture"
  ```

## Task 6: Add Annotated Backend Anti-Patterns

**Files:**
- Modify: `examples/backend/concurrency-safety-anti-patterns.ts`.

**Interfaces:**
- Consumes: the two public diagnostics and the existing example QA parser.
- Produces: one observable anti-pattern and one safe variant for each new rule.

- [ ] **Step 1: Add the required imports and declarations.** Extend the
  existing import to include `Deferred`. Add declarations for:

  ```ts
  declare const openConnection: () => Effect.Effect<unknown, never, never>;
  declare const createClient: () => Effect.Effect<unknown, never, never>;
  declare const releaseClient: (client: unknown) => Effect.Effect<void, never, never>;
  ```

- [ ] **Step 2: Add the Deferred anti-pattern and safe variants.** Add:

  ```ts
  // EXPECT: linteffect/no-manual-deferred-coordination
  // QA: Local Deferred latches should have a bounded wait or explicit ownership.
  export const unboundedReadyLatch = Effect.gen(function* () {
    const ready = yield* Deferred.make<void>();
    return yield* Deferred.await(ready);
  });

  export const boundedReadyLatch = Effect.gen(function* () {
    const ready = yield* Deferred.make<void>();
    return yield* Effect.timeout(Deferred.await(ready), "1 second");
  });
  ```

- [ ] **Step 3: Add the acquisition anti-pattern and safe variants.** Add:

  ```ts
  // EXPECT: linteffect/no-acquire-without-scoped-release
  // QA: Concurrent resource acquisition should be bracketed by scoped release ownership.
  export const unscopedConnectionWorker = Effect.fork(openConnection());

  export const scopedConnectionWorker = Effect.fork(
    Effect.scoped(openConnection()),
  );

  export const bracketedClientWorker = Effect.fork(
    Effect.acquireRelease(createClient(), releaseClient),
  );
  ```

- [ ] **Step 4: Run the example lint and commit.** Build first, then run:

  ```sh
  bun run build
  bun run lint:examples
  ```

  Expected: the annotated new warnings are observed, safe variants do not
  produce the new IDs, and the existing example expectations remain valid.
  Commit:

  ```sh
  git add examples/backend/concurrency-safety-anti-patterns.ts
  git commit -m "Add slice 7 concurrency QA examples"
  ```

## Task 7: Update README, Roadmap, And QA Inventory

**Files:**
- Modify: `README.md` near the existing Concurrency Safety entries.
- Modify: `roadmap/02-concurrency-safety/README.md`.
- Modify: `docs/rule-qa-inventory.json`.

**Interfaces:**
- Consumes: the exported rule IDs, their approved defaults, and the example/CLI evidence from Tasks 5 and 6.
- Produces: complete public documentation and an inventory state accepted by `tests/rule-qa.test.ts`.

- [ ] **Step 1: Add the README entries.** Add one table row per rule with the
  exact intent:

  ```text
  linteffect/no-manual-deferred-coordination | Local Deferred latch awaits without a visible timeout, interruption, scope, or matching finalizer. | Strict-only guidance against unbounded ad hoc coordination.
  linteffect/no-acquire-without-scoped-release | Resource-like acquisition inside concurrent Effect work without acquireRelease, acquireUseRelease, scoped ownership, or a matching finalizer. | Runtime guidance against resources outliving interrupted fibers.
  ```

  Keep the wording concise and link the fixes to `Effect.timeout`,
  `Effect.race`, `Effect.scoped`, `Effect.acquireRelease`, and finalizers.

- [ ] **Step 2: Mark the roadmap complete.** In
  `roadmap/02-concurrency-safety/README.md`:

  - change both Slice 7 expansion-backlog rows from `[ ]` to `[x]`;
  - change both Slice 7 checklist rows from `[ ]` to `[x]`;
  - update the detection cells to match the implemented local Deferred and
    concurrent resource vocabulary contracts;
  - add the new safe variants to the existing list without changing prior
    completed rule descriptions.

- [ ] **Step 3: Add QA inventory ownership.** Add exactly these JSON entries,
  maintaining the file's existing sorted order:

  ```json
  "no-acquire-without-scoped-release": "roadmap/02-concurrency-safety/README.md",
  "no-manual-deferred-coordination": "roadmap/02-concurrency-safety/README.md"
  ```

- [ ] **Step 4: Run documentation/config QA and commit.** Run:

  ```sh
  bun test tests/config.test.ts tests/rule-qa.test.ts
  git diff --check
  ```

  Expected: all group, preset, README, example, inventory, and completed-
  roadmap checks pass. Commit:

  ```sh
  git add README.md roadmap/02-concurrency-safety/README.md docs/rule-qa-inventory.json
  git commit -m "Document concurrency slice 7 rules"
  ```

## Task 8: Add The Minor Changeset And Run Release Gates

**Files:**
- Create: `.changeset/concurrency-safety-slice-7.md`.

**Interfaces:**
- Consumes: all passing implementation, fixture, example, configuration, and documentation checks.
- Produces: a Changesets-compatible minor release note for the two public rules.

- [ ] **Step 1: Add the Changeset.** Create:

  ```md
  ---
  "@opsydyn/oxlint-effect": minor
  ---

  Add concurrency-safety diagnostics for unbounded local Deferred coordination
  and resource acquisition inside concurrent Effect work without scoped release
  ownership.
  ```

- [ ] **Step 2: Run the full package gates sequentially.** Run:

  ```sh
  bun test
  bun run typecheck
  bun run build
  bun run lint
  bun run docs:api:check
  bun run size
  bun run pack:dry-run
  bun run lint:examples
  git diff --check
  ```

  Expected: every command exits successfully. `bun run build` must complete
  before `bun run pack:dry-run`; the final package must include the built
  plugin entry and remain within the existing size limit.

- [ ] **Step 3: Commit the release metadata and record the evidence.** Confirm:

  ```sh
  git status --short
  git diff HEAD^ --stat
  ```

  Expected: only the Changeset remains in the final task diff and the worktree
  is otherwise clean. Commit:

  ```sh
  git add .changeset/concurrency-safety-slice-7.md
  git commit -m "Prepare concurrency slice 7 release"
  ```

## Task 9: Verify The Branch And Open The Pull Request

**Files:** No tracked files after Task 8.

**Interfaces:**
- Consumes: the clean `concurrency/slice-7-coordination` branch and its local stack metadata.
- Produces: a pushed branch and a PR targeting `main`, with CI checks attached.

- [ ] **Step 1: Verify the final branch state.** Run:

  ```sh
  git status --short --branch
  git log --oneline --decorate main..HEAD
  ```

  Expected: clean branch, all Slice 7 commits visible after `main`, and no
  generated build artifacts staged.

- [ ] **Step 2: Push the branch.** With `gh stack` available, run:

  ```sh
  gh stack push
  gh stack view
  ```

  Otherwise run:

  ```sh
  git push -u origin concurrency/slice-7-coordination
  ```

- [ ] **Step 3: Open the PR against updated main.** With the extension, use:

  ```sh
  gh stack submit
  ```

  Otherwise use:

  ```sh
  gh pr create \
    --base main \
    --head concurrency/slice-7-coordination \
    --title "Add concurrency safety slice 7 rules" \
    --body "Adds conservative Deferred coordination and scoped-release acquisition diagnostics with unit, CLI, example, documentation, and package-gate coverage."
  ```

- [ ] **Step 4: Verify the PR and CI.** Run:

  ```sh
  gh pr view --json number,state,baseRefName,headRefName,statusCheckRollup,url
  ```

  Expected: the PR base is `main`, the head is
  `concurrency/slice-7-coordination`, and CI is pending or green. Do not claim
  the release is published until the PR is merged and the Changesets workflow
  has completed.

## Final Acceptance Checklist

- [ ] `no-manual-deferred-coordination` reports only connected local Deferred
      latch awaits without the approved bounded/owned markers.
- [ ] `no-acquire-without-scoped-release` reports only resource-like calls in
      the approved concurrent Effect roots without matching release evidence.
- [ ] The strict/runtime recommended split is represented in source and config
      tests exactly as specified.
- [ ] Unit, CLI, example, QA inventory, README, roadmap, build, packaging, and
      size gates pass.
- [ ] The Changeset is present and describes the new public diagnostics.
- [ ] The branch is pushed and the PR targets `main`.
