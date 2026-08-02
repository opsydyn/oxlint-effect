# Resource Lifetime Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three conservative Resource Lifetime rules, expose them through a focused preset, and prove their diagnostics through unit tests, Oxlint integration fixtures, annotated anti-pattern examples, documentation, and release gates.

**Architecture:** Keep the plugin's existing single-file rule architecture and ESLint-style visitors. Extract the resource-name tokenisation already used by Slice 7 into shared AST helpers, then build cleanup, scope-ownership, and resource-escape rules on top of those helpers. Preserve the existing Effect-import gate and boundary-path conventions; do not add type-aware inference or a public rule for the unavailable `Scope.global` API.

**Tech Stack:** TypeScript 5.9, Bun test runner, Oxlint JavaScript plugin API, Effect 3.21.4 AST shapes, Vitest-compatible `bun:test` assertions, `tsdown`, publint, Typedoc, size-limit, npm pack, and Changesets.

## Global Constraints

- Work only in `/Users/alancurrie/Projects/effect-oxlint/.worktrees/resource-lifetime-slice-1-cleanup` on `resource-lifetime/slice-1-cleanup`, stacked on the clean Slice 7 branch.
- Keep `effect@3.21.4` as the supported local API; do not implement `Scope.global`, which is not exported by this version.
- Keep all three rules syntax-only and conservative; do not add type resolution, constructor inference, arbitrary aliases, or project-wide dataflow.
- Require an Effect ecosystem import before any new rule reports a diagnostic.
- Honour the existing `boundaryPaths` option schema and defaults for all three rules.
- Keep `no-manual-resource-close` and `no-unbound-scope` in `recommended`; keep `no-resource-succeed-escape` out of `recommended` and in the focused `resourceLifetime` preset only.
- Keep resource-like vocabulary centralised and shared with `no-acquire-without-scoped-release`.
- Every intentional anti-pattern example must have adjacent `EXPECT` and `QA` annotations; safe variants must remain unannotated.
- Use ASCII source text and the repository's existing test, documentation, and Changeset conventions.

## File Map

- Modify `src/index.ts`: extract shared resource-name helpers; add the three rule implementations; register rules; export `resourceLifetimeRules`, `resourceLifetime`, and preset/group entries; exclude only `no-resource-succeed-escape` from `recommended`.
- Modify `tests/plugin.test.ts`: add direct invalid, safe, import-gate, boundary, and ownership tests for each rule using the existing AST builders and parent-link setup.
- Modify `tests/config.test.ts`: add the Resource Lifetime import, group expectation, preset expectation, focused rule list, and recommended inclusion/exclusion assertions.
- Modify `tests/oxlint.integration.test.ts`: assert the exact three Resource Lifetime rule IDs from a dedicated CLI fixture.
- Create `tests/fixtures/oxlint/resource-lifetime-slice-1.ts`: one intentional diagnostic per public rule plus safe forms.
- Create `tests/fixtures/oxlint/oxlint.resource-lifetime-slice-1.config.ts`: load the source plugin and enable exactly the three new rules.
- Create `examples/backend/resource-lifetime-anti-patterns.ts`: annotated manual cleanup, unbound scope, and escaped-resource examples with safe release/scoped variants.
- Modify `examples/README.md`: document the new Resource Lifetime QA corpus file.
- Modify `README.md`: add the named preset and a Resource Lifetime rule table.
- Modify `roadmap/03-resource-lifetime/README.md`: complete Slice 1’s three public rules, move resource escape into Slice 1, and record `Scope.global` as deferred for the current Effect API.
- Modify `roadmap/README.md`: add the `resourceLifetime` preset strategy and update the Resource Lifetime first-slice description.
- Modify `docs/rule-qa-inventory.json`: assign the three exported rules to the Resource Lifetime roadmap README.
- Create `.changeset/resource-lifetime-slice-1.md`: request a minor release describing the three lifecycle diagnostics and focused preset.

---

### Task 1: Add Shared Resource Helpers and `no-manual-resource-close`

**Files:**
- Modify: `tests/plugin.test.ts` near the existing Slice 7 resource tests.
- Modify: `src/index.ts` near `resourceLikeTerms`, `resourceAcquisitionCall`, and the rule implementations before `const rules`.

**Interfaces:**
- Consumes: existing `resourceLikeTerms`, `isEffectEcosystemImport`, `isBoundaryPath`, `isEffectMemberCallNamed`, `findNodes`, `isFunctionLike`, and `report` helpers.
- Produces: `identifierNameTokens(name: string): string[]`, `isResourceLikeName(name: string): boolean`, `isResourceLikeExpression(node: unknown): boolean`, `isResourceCleanupCall(node: unknown): boolean`, and the plugin rule `no-manual-resource-close`.
- Rule contract: `no-manual-resource-close` reports non-computed `.close()`, `.destroy()`, `.dispose()`, or `.cleanup()` calls on a resource-like receiver outside an approved release/finalizer callback. It returns no reports without an Effect import or inside a configured boundary path.

- [ ] **Step 1: Add failing direct tests for positive cleanup shapes.**

  Extend `tests/plugin.test.ts` with tests that run the rule through `runRuleSequence` and assert one report for each of these imported calls: `client.close()`, `fileHandle.dispose()`, `database.destroy()`, `connection.cleanup()`, and `fileHandle.close()`. Assert the reported node is the cleanup `CallExpression` and the message contains `manual resource cleanup`.

  Use a local AST builder for nested member receivers when testing `client.connection.close()`. The token matcher must recognise camel-case `fileHandle` and must not treat the unrelated `logger.close()` as resource cleanup.

  ```ts
  const reports = runRuleSequence("no-manual-resource-close", [
    { visitorName: "ImportDeclaration", node: importFrom("effect") },
    { visitorName: "CallExpression", node: objectMethodCall(identifier("fileHandle"), "dispose") },
  ]);

  expect(reports).toHaveLength(1);
  expect(reports[0].message).toContain("manual resource cleanup");
  ```

- [ ] **Step 2: Run the focused tests and verify the new tests fail.**

  Run:

  ```bash
  bun test tests/plugin.test.ts
  ```

  Expected result: the existing suite remains green except for the newly added assertions, which fail because `plugin.rules["no-manual-resource-close"]` is not registered yet.

- [ ] **Step 3: Add failing tests for gates and safe ownership evidence.**

  Add assertions that the rule reports nothing when there is no Effect import, when the filename matches a default boundary such as `server/route.ts`, and for `logger.close()`.

  Build parent-linked callback ASTs for these safe forms and assert zero reports:

  ```ts
  Effect.acquireRelease(acquireClient, () => client.close())
  Effect.acquireUseRelease(acquireClient, useClient, () => client.dispose())
  Effect.acquireReleaseInterruptible(acquireClient, () => client.destroy())
  Effect.addFinalizer(() => client.cleanup())
  Scope.addFinalizer(scope, () => client.close())
  Scope.addFinalizerExit(scope, () => client.close())
  ```

  Also assert that `Effect.ensuring(effect, () => client.close())` still reports, because `ensuring` is deliberately not release ownership evidence.

- [ ] **Step 4: Extract shared resource-name tokenisation and implement the rule.**

  Replace the inline tokenisation in `resourceAcquisitionCall` with:

  ```ts
  function identifierNameTokens(name: string): string[] {
    return name
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .map((token) => token.toLowerCase());
  }

  function isResourceLikeName(name: string): boolean {
    return identifierNameTokens(name).some((token) => resourceLikeTerms.has(token));
  }
  ```

  Keep acquisition detection equivalent by changing it to use `identifierNameTokens` and `isResourceLikeName` without changing its existing positive or negative cases. Make `isResourceLikeExpression` accept an identifier or a non-computed member expression whose terminal/property or receiver name is resource-like; do not infer types or arbitrary constructor results.

  Implement `isResourceCleanupCall` so it accepts only a non-computed member call whose property is in `close`, `destroy`, `dispose`, or `cleanup` and whose receiver passes `isResourceLikeExpression`.

  Implement release ownership detection by walking parent links from the cleanup call to the nearest enclosing call. Exempt the cleanup only when the cleanup node is inside a callback argument of `Effect.acquireRelease`, `Effect.acquireUseRelease`, `Effect.acquireReleaseInterruptible`, `Effect.addFinalizer`, `Scope.addFinalizer`, or `Scope.addFinalizerExit`. Do not exempt `Effect.ensuring` or unrelated callback calls.

  Add the rule before `const rules`:

  ```ts
  const noManualResourceClose = defineRule({
    meta: { schema: boundaryPathOptionsSchema },
    create(context: OxlintContext) {
      let hasEffectEcosystemImport = false;
      return {
        ImportDeclaration(node: any) {
          const source = getImportSource(node);
          if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
        },
        CallExpression(node: any) {
          if (
            !hasEffectEcosystemImport ||
            isBoundaryPath(context) ||
            !isResourceCleanupCall(node) ||
            hasReleaseOwnership(node)
          ) return;
          report(context, node, "Rule: avoid manual resource cleanup. Why: direct close/dispose calls can bypass Effect scope ownership. Fix: acquire the resource with Effect.acquireRelease or register cleanup with a Scope finalizer.");
        },
      };
    },
  });
  ```

  Use the repository's exact `defineRule`, `OxlintContext`, `getImportSource`, `boundaryPathOptionsSchema`, `isBoundaryPath`, and `report` conventions; the snippet fixes the contract and message shape, while local formatting should follow surrounding code.

- [ ] **Step 5: Run the rule tests and the Slice 7 regression tests.**

  Run:

  ```bash
  bun test tests/plugin.test.ts
  ```

  Expected result: all manual-close tests and all pre-existing plugin tests pass. In particular, the shared helper extraction does not alter the existing `no-acquire-without-scoped-release` results.

- [ ] **Step 6: Commit the first rule.**

  ```bash
  git add src/index.ts tests/plugin.test.ts
  git commit -m "feat: add manual resource cleanup rule"
  ```

### Task 2: Add `no-unbound-scope`

**Files:**
- Modify: `tests/plugin.test.ts` beside the Task 1 tests.
- Modify: `src/index.ts` beside `noManualResourceClose`.

**Interfaces:**
- Consumes: `isEffectEcosystemImport`, `isBoundaryPath`, `isEffectMemberCallNamed`, `isFunctionLike`, `findNodes`, `isResourceLikeName` helpers only where needed for shared traversal, and the existing AST node predicates.
- Produces: `scopeMakeCall(node: unknown): boolean`, `hasScopedScopeOwner(node: unknown): boolean`, `hasMatchingScopeClose(node: unknown): boolean`, and the plugin rule `no-unbound-scope`.
- Rule contract: report `Scope.make(...)` in Effect logic unless an enclosing `Effect.scoped`/`Layer.scoped`, a matching `Scope.close`, or a release callback with matching `Scope.close` proves ownership. `Scope.addFinalizer` alone is not ownership evidence for a separately created scope.

- [ ] **Step 1: Add failing tests for an unbound scope and the import/boundary gates.**

  Build a parent-linked `Scope.make()` call and assert one report after an `effect` import. Assert the report node is the `Scope.make()` call and the message contains `unbound scope`.

  Add zero-report assertions for the same node without an Effect import and with `filename: "/repo/server/route.ts"`. This confirms the new rule uses the existing default boundary policy rather than inventing a new path option.

- [ ] **Step 2: Run the focused tests and verify the new assertions fail.**

  Run:

  ```bash
  bun test tests/plugin.test.ts
  ```

  Expected result: only the new `no-unbound-scope` assertions fail because the rule is not yet registered.

- [ ] **Step 3: Add failing tests for all approved ownership forms and the rejected finalizer-only form.**

  Add parent-linked AST cases asserting zero reports for:

  ```ts
  Effect.scoped(Effect.gen(function* () {
    const scope = yield* Scope.make();
    return scope;
  }))

  Layer.scoped(Effect.gen(function* () {
    const scope = yield* Scope.make();
    return scope;
  }))

  Effect.gen(function* () {
    const scope = yield* Scope.make();
    yield* Scope.close(scope, Exit.void);
  })

  Effect.acquireRelease(
    Scope.make(),
    (scope) => Scope.close(scope, Exit.void),
  )
  ```

  Add a positive assertion for `Effect.gen(function* () { const scope = yield* Scope.make(); yield* Scope.addFinalizer(scope, finalizer); })`: registering a finalizer does not close a separately created scope, so `Scope.make()` remains reported under this conservative contract.

- [ ] **Step 4: Implement simple scope ownership analysis.**

  Recognise only a non-computed `Scope.make` member call. Track ownership from the call's parent links and local lexical structure:

  - `hasScopedScopeOwner` walks ancestors and returns true only for `Effect.scoped(...)` or `Layer.scoped(...)`.
  - `hasMatchingScopeClose` finds the nearest enclosing function/generator body, identifies a direct local binding whose initializer is `Scope.make()` or `yield* Scope.make()`, and searches that same body for `Scope.close(bindingName, ...)`.
  - For a direct `Scope.make()` first argument to `Effect.acquireRelease`, `Effect.acquireUseRelease`, or `Effect.acquireReleaseInterruptible`, inspect the release callback's first parameter and accept only a `Scope.close` call whose first argument is that same callback parameter.
  - Do not accept a different identifier, a property alias, `Scope.addFinalizer`, an arbitrary function call, or a type annotation as ownership evidence.

  Add the rule using `meta: { schema: boundaryPathOptionsSchema }`, `ImportDeclaration`, and `CallExpression` or `Program:exit` in the same style as neighbouring rules. If using `Program:exit` to deduplicate traversal, report each `Scope.make` node once and keep the test harness invocation explicit with `{ visitorName: "Program:exit", node: program }`.

  Use this diagnostic text:

  ```text
  Rule: bind Scope.make to an owned lifecycle. Why: an unbound Scope can leak resources and finalizers. Fix: use Effect.scoped/Layer.scoped, close the scope explicitly, or acquire it with a matching release callback.
  ```

- [ ] **Step 5: Run scope tests and the complete plugin unit file.**

  ```bash
  bun test tests/plugin.test.ts
  ```

  Expected result: all scope ownership cases pass and the existing  rule tests remain green.

- [ ] **Step 6: Commit the second rule.**

  ```bash
  git add src/index.ts tests/plugin.test.ts
  git commit -m "feat: add unbound scope rule"
  ```

### Task 3: Add `no-resource-succeed-escape`

**Files:**
- Modify: `tests/plugin.test.ts` beside the other Resource Lifetime tests.
- Modify: `src/index.ts` beside the other new rules and in the rule registry.

**Interfaces:**
- Consumes: `isResourceLikeExpression`, `isEffectMemberCallNamed`, `isEffectEcosystemImport`, `isBoundaryPath`, and the existing first-argument helper.
- Produces: the plugin rule `no-resource-succeed-escape`.
- Rule contract: report only `Effect.succeed(resourceLikeIdentifierOrMember)` in imported, non-boundary Effect modules. Do not report literals, ordinary domain values, or non-Effect modules.

- [ ] **Step 1: Add failing tests for escape and safe value shapes.**

  Add one-report tests for `Effect.succeed(client)`, `Effect.succeed(database.pool)`, and `Effect.succeed(fileHandle)`. Add zero-report tests for `Effect.succeed("ok")`, `Effect.succeed(order)`, `Effect.succeed({ client: true })`, and `Effect.succeed(client)` without an Effect import.

  Add a boundary-path zero-report assertion and assert the reported node is the outer `Effect.succeed(...)` call. Assert the message contains `resource escape`.

- [ ] **Step 2: Run the focused tests and verify they fail before implementation.**

  ```bash
  bun test tests/plugin.test.ts
  ```

  Expected result: only the new rule assertions fail because no rule with this ID is registered.

- [ ] **Step 3: Implement the runtime-focused escape rule.**

  Use the existing boundary option schema and import gate. In `CallExpression`, require `isEffectMemberCallNamed(node, "succeed")`, read the first argument, and call `isResourceLikeExpression` on it. Report with:

  ```text
  Rule: do not let live resources escape through Effect.succeed. Why: ordinary success values do not express resource lifetime ownership. Fix: keep the resource inside Effect.acquireRelease, Scope, or a service layer.
  ```

  Keep the rule out of any automatic recommended filtering list until Task 4 explicitly adds the focused-only exclusion.

- [ ] **Step 4: Run the complete plugin tests.**

  ```bash
  bun test tests/plugin.test.ts
  ```

  Expected result: all three direct rule suites and all existing plugin rules pass.

- [ ] **Step 5: Commit the third rule.**

  ```bash
  git add src/index.ts tests/plugin.test.ts
  git commit -m "feat: detect escaped resource values"
  ```

### Task 4: Export the Resource Lifetime Group and Preset

**Files:**
- Modify: `tests/config.test.ts`.
- Modify: `src/index.ts` around the `rules` map, recommended filtering, rule groups, presets, and named exports.

**Interfaces:**
- Consumes: registered `no-manual-resource-close`, `no-unbound-scope`, and `no-resource-succeed-escape` rule objects.
- Produces: `resourceLifetimeRules`, `resourceLifetime`, `ruleGroups.resourceLifetime`, `presets.resourceLifetime`, and the package's recommended configuration containing only the first two new rules.

- [ ] **Step 1: Extend config tests before changing exports.**

  Import `resourceLifetime` and `resourceLifetimeRules` in `tests/config.test.ts`. Add:

  ```ts
  resourceLifetime: [
    "no-manual-resource-close",
    "no-unbound-scope",
    "no-resource-succeed-escape",
  ],
  ```

  to `groupExpectations`, and add matching `resourceLifetime` entries to `exportedRuleGroups` and `exportedPresets`.

  Extend the recommended assertion to require:

  ```ts
  expect(recommended.rules).toHaveProperty("linteffect/no-manual-resource-close", "error");
  expect(recommended.rules).toHaveProperty("linteffect/no-unbound-scope", "error");
  expect(recommended.rules).not.toHaveProperty("linteffect/no-resource-succeed-escape");
  ```

  Keep the existing strict-rule exclusion assertions unchanged.

- [ ] **Step 2: Run config tests and verify the export assertions fail.**

  ```bash
  bun test tests/config.test.ts
  ```

  Expected result: the test module cannot satisfy the new named imports and group/preset expectations until `src/index.ts` is updated.

- [ ] **Step 3: Register the rule objects and add the group.**

  Add the three entries to `const rules`, define:

  ```ts
  export const resourceLifetimeRules = rulesFromNames([
    "no-manual-resource-close",
    "no-unbound-scope",
    "no-resource-succeed-escape",
  ] as const);
  ```

  Add `resourceLifetime: resourceLifetimeRules` to `ruleGroups`, add `export const resourceLifetime = presetFor(resourceLifetimeRules)`, and add it to `presets`.

  Update recommended filtering with a focused-only exclusion set containing `no-resource-succeed-escape` in addition to the existing strict names. Keep the type predicate valid by defining the exclusion list as `readonly RuleName[]` and deriving `recommendedRules` through the same `rulesFromNames` path.

- [ ] **Step 4: Run configuration, plugin, and type checks.**

  ```bash
  bun test tests/config.test.ts tests/plugin.test.ts
  bun run typecheck
  ```

  Expected result: all group/preset comparisons pass, the recommended map includes exactly the two low-noise rules, and TypeScript accepts all public exports.

- [ ] **Step 5: Commit the public configuration surface.**

  ```bash
  git add src/index.ts tests/config.test.ts
  git commit -m "feat: export resource lifetime preset"
  ```

### Task 5: Prove the Three Rules Through the Oxlint CLI

**Files:**
- Modify: `tests/oxlint.integration.test.ts`.
- Create: `tests/fixtures/oxlint/resource-lifetime-slice-1.ts`.
- Create: `tests/fixtures/oxlint/oxlint.resource-lifetime-slice-1.config.ts`.

**Interfaces:**
- Consumes: the source plugin entry point and the three public rule IDs.
- Produces: an exact diagnostic contract for one cleanup, one unbound scope, and one escaped resource, with safe forms proving that the fixture is not merely checking broad text matches.

- [ ] **Step 1: Add the integration assertion and fixture references.**

  Add a test next to the Slice 7 integration test:

  ```ts
  it("reports exactly the Resource Lifetime Slice 1 diagnostics", () => {
    const result = runOxlint(
      "resource-lifetime-slice-1.ts",
      "oxlint.resource-lifetime-slice-1.config.ts",
    );
    const ruleIds = [...result.output.matchAll(/linteffect\\(([^)]+)\\)/g)]
      .map((match) => match[1])
      .sort();

    expect(result.status).toBe(1);
    expect(ruleIds).toEqual([
      "no-manual-resource-close",
      "no-resource-succeed-escape",
      "no-unbound-scope",
    ]);
  });
  ```

  Before creating the fixture contents, run the integration file once and verify it fails because the fixture/config files are absent.

- [ ] **Step 2: Create the exact-rule config and fixture.**

  Configure the source plugin with:

  ```ts
  import { defineConfig } from "oxlint";

  export default defineConfig({
    jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
    rules: {
      "linteffect/no-manual-resource-close": "error",
      "linteffect/no-unbound-scope": "error",
      "linteffect/no-resource-succeed-escape": "error",
    },
  });
  ```

  In the fixture, import `Effect` and `Scope`, declare resource-like values, and include exactly these intentional shapes:

  ```ts
  export const manuallyClosed = Effect.gen(function* () {
    client.close();
  });

  export const unbound = Effect.gen(function* () {
    const scope = yield* Scope.make();
    return scope;
  });

  export const escaped = Effect.succeed(client);
  ```

  Add safe `Effect.acquireRelease`, `Effect.scoped`, explicit `Scope.close`, and non-resource `Effect.succeed("ok")` variants without adding a fourth diagnostic.

- [ ] **Step 3: Run the integration test and verify the exact output.**

  ```bash
  bun test tests/oxlint.integration.test.ts
  ```

  Expected result: the new test passes with exactly one instance of each new rule ID, and all existing CLI integration tests remain green.

- [ ] **Step 4: Commit the CLI contract.**

  ```bash
  git add tests/oxlint.integration.test.ts tests/fixtures/oxlint/resource-lifetime-slice-1.ts tests/fixtures/oxlint/oxlint.resource-lifetime-slice-1.config.ts
  git commit -m "test: cover resource lifetime rules through oxlint"
  ```

### Task 6: Add Annotated QA Examples, README Documentation, and Roadmap State

**Files:**
- Create: `examples/backend/resource-lifetime-anti-patterns.ts`.
- Modify: `examples/README.md`.
- Modify: `README.md`.
- Modify: `roadmap/03-resource-lifetime/README.md`.
- Modify: `roadmap/README.md`.
- Modify: `docs/rule-qa-inventory.json`.

**Interfaces:**
- Consumes: exported rule IDs, the `resourceLifetime` preset, and the completed Resource Lifetime roadmap path.
- Produces: one annotated anti-pattern per rule, safe examples for every ownership exemption, one README entry per exported rule, and a roadmap/inventory state that satisfies `tests/rule-qa.test.ts`.

- [ ] **Step 1: Add the annotated backend anti-pattern file.**

  Create `examples/backend/resource-lifetime-anti-patterns.ts` with imports and declarations sufficient for lint-only parsing. Place an adjacent annotation on each intentional violation:

  ```ts
  // EXPECT: linteffect/no-manual-resource-close
  // QA: Direct cleanup bypasses Effect's release ownership.
  export const manualClose = Effect.gen(function* () {
    client.close();
  });

  // EXPECT: linteffect/no-unbound-scope
  // QA: Scope.make is created without scoped ownership or a matching close.
  export const leakedScope = Effect.gen(function* () {
    const scope = yield* Scope.make();
    return scope;
  });

  // EXPECT: linteffect/no-resource-succeed-escape
  // QA: A live client escapes as an ordinary success value.
  export const escapedClient = Effect.succeed(client);
  ```

  Include unannotated safe variants for `Effect.acquireRelease`, `Effect.acquireUseRelease`, `Effect.acquireReleaseInterruptible`, `Effect.addFinalizer`, `Scope.addFinalizer`, `Scope.addFinalizerExit`, `Effect.scoped`, `Layer.scoped`, explicit `Scope.close`, `logger.close()`, and `Effect.succeed("ok")`. Avoid `Effect.succeed(client)` in any safe release setup so the escape rule is not intentionally triggered a second time.

- [ ] **Step 2: Run the QA contract and confirm the expected documentation failures.**

  ```bash
  bun test tests/rule-qa.test.ts
  ```

  Expected result: the new example IDs are found, but the test reports missing README rows, inventory entries, or incomplete roadmap ownership until the remaining documentation edits are made.

- [ ] **Step 3: Document the preset and rules.**

  Add `resourceLifetime` to the named preset table in `README.md`, and add a Resource Lifetime table with these rows:

  | Rule | Catches | Why |
  | --- | --- | --- |
  | `linteffect/no-manual-resource-close` | Resource-like `.close()`, `.destroy()`, `.dispose()`, or `.cleanup()` calls outside release/finalizer callbacks. | Keeps cleanup owned by Effect scopes instead of ad hoc imperative code. |
  | `linteffect/no-unbound-scope` | `Scope.make()` without `Effect.scoped`, `Layer.scoped`, explicit `Scope.close`, or a matching acquire/release callback. | Prevents scopes and their finalizers from being leaked. |
  | `linteffect/no-resource-succeed-escape` | `Effect.succeed(resourceLike)` for client, connection, pool, file, socket, stream, server, subscription, or handle-shaped values. | Keeps live resource lifetimes inside scoped Effect ownership; this heuristic is focused-only rather than recommended. |

  Explain that the rules are syntax-only, share the central resource-like vocabulary, require an Effect import, and support `boundaryPaths`.

- [ ] **Step 4: Update the Resource Lifetime roadmap and inventory.**

  In `roadmap/03-resource-lifetime/README.md`:

  - mark the three public Slice 1 rows `[x]`;
  - move `no-resource-succeed-escape` from Slice 2 into Slice 1;
  - leave `no-scope-global` unchecked and add a note that Effect 3.21.4 does not export `Scope.global`, so the candidate is deferred rather than shipped as an untestable rule;
  - leave the remaining Slice 2, 3, and 4 candidates unchecked;
  - keep the central resource-like vocabulary list.

  In `roadmap/README.md`, add `resourceLifetime` to Preset Strategy and change the Resource Lifetime first-slice text to `manual close, unbound scope, resource escape`.

  Add these exact inventory mappings to sorted `docs/rule-qa-inventory.json`:

  ```json
  "no-manual-resource-close": "roadmap/03-resource-lifetime/README.md",
  "no-resource-succeed-escape": "roadmap/03-resource-lifetime/README.md",
  "no-unbound-scope": "roadmap/03-resource-lifetime/README.md",
  ```

  Add a `resource-lifetime-anti-patterns.ts` bullet to the Beyond-Parity Examples section in `examples/README.md`.

- [ ] **Step 5: Run README, roadmap, and example QA checks.**

  ```bash
  bun test tests/rule-qa.test.ts
  bun run lint:examples > /tmp/linteffect-resource-lifetime-observed.log 2>&1 || true
  rg -o "EXPECT: linteffect/[a-zA-Z0-9-]+" examples | sed "s/.*EXPECT: //" | sort -u > /tmp/linteffect-resource-lifetime-expected.txt
  rg -o "linteffect\\([^)]+\\)" /tmp/linteffect-resource-lifetime-observed.log | sed "s/linteffect(/linteffect\\//; s/)//" | sort -u > /tmp/linteffect-resource-lifetime-observed.txt
  comm -23 /tmp/linteffect-resource-lifetime-expected.txt /tmp/linteffect-resource-lifetime-observed.txt
  ```

  Expected result: `bun test tests/rule-qa.test.ts` passes and the final `comm` command prints no lines for the new annotations. Existing intentional diagnostics may remain in the full example lint log.

- [ ] **Step 6: Commit QA and documentation.**

  ```bash
  git add examples/backend/resource-lifetime-anti-patterns.ts examples/README.md README.md roadmap/03-resource-lifetime/README.md roadmap/README.md docs/rule-qa-inventory.json
  git commit -m "docs: add resource lifetime QA guidance"
  ```

### Task 7: Prepare the Minor Release

**Files:**
- Create: `.changeset/resource-lifetime-slice-1.md`.

**Interfaces:**
- Consumes: the three completed public rules and the `resourceLifetime` preset.
- Produces: a Changesets minor-release entry with user-facing notes and no package metadata changes outside Changesets.

- [ ] **Step 1: Create the Changeset.**

  Add:

  ```md
  ---
  "@opsydyn/oxlint-effect": minor
  ---

  Add Resource Lifetime diagnostics for manual resource cleanup, unbound scopes,
  and live resources escaping through `Effect.succeed`, plus a focused
  `resourceLifetime` preset.
  ```

- [ ] **Step 2: Validate the release metadata.**

  ```bash
  bun run changeset status
  git diff --check
  ```

  Expected result: Changesets reports one minor release for `@opsydyn/oxlint-effect`, and the diff has no whitespace errors.

- [ ] **Step 3: Commit the release note.**

  ```bash
  git add .changeset/resource-lifetime-slice-1.md
  git commit -m "chore: prepare resource lifetime slice release"
  ```

### Task 8: Run the Complete Slice Verification

**Files:**
- Verify all files changed by Tasks 1-7; do not modify source during this task unless a command identifies a concrete failure.

**Interfaces:**
- Consumes: the complete Resource Lifetime Slice 1 branch.
- Produces: fresh evidence that unit tests, config exports, CLI integration, typechecking, build, package lint, docs, size, pack, and annotated examples all pass their intended gates.

- [ ] **Step 1: Run the complete automated test suite.**

  ```bash
  bun run test
  ```

  Expected result: all plugin, config, integration, and QA tests pass with zero failures.

- [ ] **Step 2: Run static, build, package, and documentation gates.**

  ```bash
  bun run typecheck
  bun run build
  bun run lint
  bun run docs:api:check
  bun run size
  bun run pack:dry-run
  ```

  Expected result: TypeScript, tsdown, publint, Typedoc, size-limit, and npm pack dry-run all succeed. The package tarball contains the built plugin and README without source-only test or example files.

- [ ] **Step 3: Re-run the intentional example feedback loop.**

  ```bash
  bun run lint:examples > /tmp/linteffect-resource-lifetime-final.log 2>&1 || true
  rg -o "EXPECT: linteffect/[a-zA-Z0-9-]+" examples | sed "s/.*EXPECT: //" | sort -u > /tmp/linteffect-resource-lifetime-final-expected.txt
  rg -o "linteffect\\([^)]+\\)" /tmp/linteffect-resource-lifetime-final.log | sed "s/linteffect(/linteffect\\//; s/)//" | sort -u > /tmp/linteffect-resource-lifetime-final-observed.txt
  comm -23 /tmp/linteffect-resource-lifetime-final-expected.txt /tmp/linteffect-resource-lifetime-final-observed.txt
  git diff --check
  git status --short
  ```

  Expected result: the expected-rule difference is empty, the diff check is clean, and the working tree contains only the intentionally committed branch history or any explicitly reviewed build output excluded by git.

- [ ] **Step 4: Record verification before integration.**

  Review `git log --oneline --decorate -8`, confirm the branch remains based on the Slice 7 branch, and report the exact test/build/package results. Do not claim the Slice 7 PR or this branch is merged or published until a later integration and release operation succeeds.
