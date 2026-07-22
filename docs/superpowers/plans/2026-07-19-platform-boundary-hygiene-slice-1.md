# Platform And Boundary Hygiene Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship three conservative, Effect-gated portability and boundary rules, with a public `platformAndBoundaryHygiene` preset.

**Architecture:** Rules remain in `src/index.ts`, following the existing module-level Effect-import gate and `defineRule` visitor shape. Import-dependent rules collect facts through the program and report at `Program:exit`; the clock rule recursively finds `Date.now()` within agreed Effect callback boundaries and deduplicates each call site. The public group is registered alongside the existing config-shaped rule presets.

**Tech Stack:** TypeScript, `@oxlint/plugins`, Bun test, Oxlint CLI. Changesets are out of scope until a release is requested.

## Global Constraints

- Keep all three detections AST-only and Effect-gated.
- Do not add path, type, `require`, dynamic-import, or JSON-result data-flow analysis.
- A Schema import is the JSON.parse rule's explicit conservative opt-out.
- Use the repository's `EXPECT` and `QA` example annotation format.
- Do not create a changeset in this slice.
- Preserve a green repository suite after each registered rule by adding that
  rule's `linteffect/*` entry to the exact `recommended.rules` expectation in
  `tests/config.test.ts`; defer only the new group-specific config assertions
  to Task 4.

---

### Task 1: Detect Node FS Imports In Effect Modules

**Files:**
- Modify: `tests/plugin.test.ts`
- Modify: `tests/config.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `getImportSource()`, `isEffectEcosystemImport()`, `report()`, and `runRuleSequence()`.
- Produces: registered `linteffect/no-node-fs-in-effect-code`.

- [ ] **Step 1: Write the failing direct-rule tests**

Add a `describe("no-node-fs-in-effect-code", ...)` block. Use imports in both source orders and finish the visitor sequence with `Program:exit`:

~~~ts
const reports = runRuleSequence("no-node-fs-in-effect-code", [
  { visitorName: "ImportDeclaration", node: importFrom("node:fs") },
  { visitorName: "ImportDeclaration", node: importFrom("effect") },
  { visitorName: "Program:exit", node: {} },
]);

expect(reports).toHaveLength(1);
expect(reports[0]?.message).toContain("node:fs");
~~~

Add positive cases for `fs`, `node:fs`, `fs/promises`, and
`node:fs/promises`, plus module-scope `require(...)`; add safe cases for
function-scoped `require(...)`, `node:path`, and a Node FS reference without an
Effect import.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `bun test tests/plugin.test.ts --test-name-pattern no-node-fs-in-effect-code`

Expected: FAIL because the plugin does not export the rule.

- [ ] **Step 3: Add the minimal rule implementation**

In `src/index.ts`, add the source set and a rule adjacent to other import-gated rules:

~~~ts
const nodeFsImportSources = new Set(["fs", "node:fs", "fs/promises", "node:fs/promises"]);

const noNodeFsInEffectCode = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const nodeFsImports: unknown[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
        if (source && nodeFsImportSources.has(source)) nodeFsImports.push(node);
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport) return;
        for (const node of nodeFsImports) {
          report(context, node, "Rule: avoid Node fs imports in Effect code. Why: direct Node filesystem APIs make reusable Effect modules platform-specific. Fix: move filesystem work behind an Effect platform service at the application boundary.");
        }
      },
    };
  },
});
~~~

Collect supported module-scope `require(...)` calls alongside imports, while
tracking function entry and exit so function-scoped calls remain allowed.

Register `"no-node-fs-in-effect-code"` in the `rules` object.

In `tests/config.test.ts`, add `"linteffect/no-node-fs-in-effect-code":
"error"` to the exact `recommended.rules` expectation.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `bun test tests/plugin.test.ts --test-name-pattern no-node-fs-in-effect-code`

Expected: PASS.

- [ ] **Step 5: Commit the focused rule**

~~~bash
git add src/index.ts tests/plugin.test.ts tests/config.test.ts
git commit -m "Add Node fs boundary rule"
~~~

### Task 2: Detect Unvalidated JSON Parsing In Effect Modules

**Files:**
- Modify: `tests/plugin.test.ts`
- Modify: `tests/config.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `getImportSource()`, `isEffectEcosystemImport()`, and `isMemberExpression()`.
- Produces: registered `linteffect/no-json-parse-without-schema`.

- [ ] **Step 1: Write the failing direct-rule tests**

Add a `describe("no-json-parse-without-schema", ...)` block:

~~~ts
const reports = runRuleSequence("no-json-parse-without-schema", [
  { visitorName: "ImportDeclaration", node: importFrom("effect") },
  { visitorName: "CallExpression", node: memberCall("JSON", "parse") },
  { visitorName: "Program:exit", node: {} },
]);

expect(reports).toHaveLength(1);
expect(reports[0]?.message).toContain("Schema.decodeUnknown");
~~~

Add safe cases for `effect/Schema`, a named `Schema` import from `effect`, a
non-JSON call, and JSON parsing in a module with no Effect import. Cover both
late Effect and late Schema imports.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `bun test tests/plugin.test.ts --test-name-pattern no-json-parse-without-schema`

Expected: FAIL because the plugin does not export the rule.

- [ ] **Step 3: Add the minimal rule implementation**

Add `importsEffectSchema(node)` to recognise an `effect/Schema` import and a named `Schema` binding from `effect`. Add the rule:

~~~ts
const noJsonParseWithoutSchema = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    let hasEffectSchemaImport = false;
    const jsonParseCalls: unknown[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
        if (importsEffectSchema(node)) hasEffectSchemaImport = true;
      },
      CallExpression(node: any) {
        if (isMemberExpression(node.callee, "JSON", "parse")) {
          jsonParseCalls.push(node);
        }
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport || hasEffectSchemaImport) return;
        for (const node of jsonParseCalls) {
          report(context, node, "Rule: avoid JSON.parse without an Effect Schema boundary. Why: parsed JSON is unknown input and unchecked casts hide malformed data. Fix: decode unknown input with Schema.decodeUnknown at the boundary.");
        }
      },
    };
  },
});
~~~

Register `"no-json-parse-without-schema"` in the `rules` object.

In `tests/config.test.ts`, add `"linteffect/no-json-parse-without-schema":
"error"` to the exact `recommended.rules` expectation.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `bun test tests/plugin.test.ts --test-name-pattern no-json-parse-without-schema`

Expected: PASS.

- [ ] **Step 5: Commit the focused rule**

~~~bash
git add src/index.ts tests/plugin.test.ts tests/config.test.ts
git commit -m "Add JSON Schema boundary rule"
~~~

### Task 3: Detect Wall-Clock Reads Inside Effect Construction

**Files:**
- Modify: `tests/plugin.test.ts`
- Modify: `tests/config.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `isEffectMemberCallNamed()`, `getEffectGeneratorArgument()`, and recursive AST traversal helpers.
- Produces: registered `linteffect/no-date-now-in-effect`.

- [ ] **Step 1: Write the failing direct-rule tests**

Add a `dateNowCall()` helper and a `describe("no-date-now-in-effect", ...)` block:

~~~ts
const dateNowCall = () => memberCall("Date", "now");

const reports = runRuleSequence("no-date-now-in-effect", [
  { visitorName: "ImportDeclaration", node: importFrom("effect") },
  {
    visitorName: "CallExpression",
    node: effectCall("sync", arrowCallback(dateNowCall())),
  },
  { visitorName: "Program:exit", node: {} },
]);

expect(reports).toHaveLength(1);
expect(reports[0]?.message).toContain("Clock");
~~~

Cover `Effect.sync` and `Effect.gen` positives, a nested `Effect.gen`/
`Effect.sync` case that reports once, an Effect import declared after the
candidate, and safe top-level `Date.now()`, `Clock.currentTime`, and non-Effect
cases.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `bun test tests/plugin.test.ts --test-name-pattern no-date-now-in-effect`

Expected: FAIL because the plugin does not export the rule.

- [ ] **Step 3: Add the minimal rule implementation**

Add helpers that recognise `Date.now()`, recognise `Effect.gen`, `sync`, `try`, `tryPromise`, and `fn`, then only traverse each boundary call's arguments. Deduplicate reports with a `WeakSet<object>`:

~~~ts
const effectConstructionBoundaries = new Set(["gen", "sync", "try", "tryPromise", "fn"]);

const noDateNowInEffect = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const collectedDateCalls = new WeakSet<object>();
    const dateNowCalls: unknown[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
      },
      CallExpression(node: any) {
        if (!isEffectConstructionBoundary(node)) return;
        for (const dateNowCall of findDateNowCalls(node.arguments)) {
          if (collectedDateCalls.has(dateNowCall as object)) continue;
          collectedDateCalls.add(dateNowCall as object);
          dateNowCalls.push(dateNowCall);
        }
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport) return;
        for (const dateNowCall of dateNowCalls) {
          report(context, dateNowCall, "Rule: avoid Date.now inside Effect logic. Why: direct wall-clock reads make programs nondeterministic and difficult to test. Fix: obtain time through Effect Clock or DateTime at the boundary.");
        }
      },
    };
  },
});
~~~

Ensure the recursive helper skips `parent` links. Register `"no-date-now-in-effect"` in `rules`.

In `tests/config.test.ts`, add `"linteffect/no-date-now-in-effect": "error"`
to the exact `recommended.rules` expectation.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `bun test tests/plugin.test.ts --test-name-pattern no-date-now-in-effect`

Expected: PASS with one diagnostic per offending call site.

- [ ] **Step 5: Commit the focused rule**

~~~bash
git add src/index.ts tests/plugin.test.ts tests/config.test.ts
git commit -m "Add Effect clock boundary rule"
~~~

### Task 4: Publish The Group, Fixtures, Documentation, And Roadmap State

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/config.test.ts`
- Modify: `tests/fixtures/oxlint/oxlint.config.ts`
- Modify: `tests/fixtures/oxlint/invalid.ts`
- Modify: `tests/oxlint.integration.test.ts`
- Create: `examples/backend/platform-boundary-hygiene-anti-patterns.ts`
- Modify: `README.md`
- Modify: `roadmap/07-platform-and-boundary-hygiene/README.md`

**Interfaces:**
- Consumes: the three registered rule names from Tasks 1-3.
- Produces: `platformAndBoundaryHygieneRules`, `platformAndBoundaryHygiene`, complete CLI/example coverage, and Slice 1 roadmap completion.

- [ ] **Step 1: Write failing config and CLI expectations**

In `tests/config.test.ts`, import both new exports and add the following group to `groupExpectations` plus its matching group/preset assertion records:

~~~ts
platformAndBoundaryHygiene: [
  "no-node-fs-in-effect-code",
  "no-json-parse-without-schema",
  "no-date-now-in-effect",
],
~~~

Add the three invalid patterns to `tests/fixtures/oxlint/invalid.ts`, then assert the three `linteffect(...)` diagnostics in `tests/oxlint.integration.test.ts`.

Add the same three rule keys to the explicit `rules` object in
`tests/fixtures/oxlint/oxlint.config.ts` so the CLI fixture enables them:

~~~ts
"linteffect/no-node-fs-in-effect-code": "error",
"linteffect/no-json-parse-without-schema": "error",
"linteffect/no-date-now-in-effect": "error",
~~~

- [ ] **Step 2: Run focused config and CLI tests and verify RED**

Run: `bun test tests/config.test.ts tests/oxlint.integration.test.ts`

Expected: FAIL because the public group has not yet been exported.

- [ ] **Step 3: Wire the public preset and complete user-facing coverage**

Add the new group after `serviceAndLayerArchitectureRules`:

~~~ts
export const platformAndBoundaryHygieneRules = rulesFromNames([
  "no-node-fs-in-effect-code",
  "no-json-parse-without-schema",
  "no-date-now-in-effect",
] as const);
~~~

Add the rules export to `ruleGroups`, create the config-shaped preset with `presetFor`, and add it to `presets`. `allRules` automatically includes registered rules.

Create `examples/backend/platform-boundary-hygiene-anti-patterns.ts` with one annotation per rule:

~~~ts
// EXPECT: linteffect/no-json-parse-without-schema
// QA: JSON input must be decoded with an Effect Schema at the boundary.
const parsedPayload = JSON.parse("{\"id\": \"user-1\"}");
~~~

Add equivalent `EXPECT`/ `QA` examples for `node:fs` and `Effect.sync(() => Date.now())`, with `void` statements for unused values. Update the README named-preset table and add a Platform and Boundary Hygiene rule table. Mark the three Slice 1 rows and checklist entries complete in the roadmap.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `bun test tests/config.test.ts tests/oxlint.integration.test.ts tests/plugin.test.ts`

Expected: PASS with the new group export and all three CLI diagnostics.

- [ ] **Step 5: Run the full repository verification gate**

Run:

~~~bash
bun run test
bun run typecheck
bun run docs:api:check
bun run build
bun run lint
bun run size
bun run pack:dry-run
git diff --check
~~~

Expected: every command exits with code 0 and the package remains inside its configured size limit.

- [ ] **Step 6: Commit the integrated slice**

~~~bash
git add src/index.ts tests/plugin.test.ts tests/config.test.ts \
  tests/fixtures/oxlint/oxlint.config.ts tests/fixtures/oxlint/invalid.ts \
  tests/oxlint.integration.test.ts \
  examples/backend/platform-boundary-hygiene-anti-patterns.ts README.md \
  roadmap/07-platform-and-boundary-hygiene/README.md
git commit -m "Add platform boundary hygiene rules"
~~~

## Plan Self-Review

- Spec coverage: Tasks 1-3 implement the approved rule contracts; Task 4 exports the group and supplies the required CLI, example, README, and roadmap coverage.
- Placeholder scan: no incomplete requirements or deferred implementation steps remain.
- Type consistency: public exports use the exact approved `platformAndBoundaryHygiene` and `platformAndBoundaryHygieneRules` names.
