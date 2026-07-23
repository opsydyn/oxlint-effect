# Platform And Boundary Hygiene Slice 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship configurable path-aware rules for Node platform imports, direct environment reads, and hidden Effect execution, with examples, public group coverage, and Oxlint CLI proof.

**Architecture:** Add small path and rule-option helpers beside the existing AST helpers in `src/index.ts`. Rules receive `context.filename` and `context.options`, use the shared default boundary/config patterns, and remain syntax-only. Import-dependent hidden execution candidates are collected and reported at `Program:exit` so source order cannot affect diagnostics. Register each rule in `rules`; the existing `recommended = presetFor(allRules)` contract then keeps recommended configuration exact.

**Tech Stack:** TypeScript, `@oxlint/plugins`, Bun test, Oxlint CLI, tsdown, publint, TypeDoc.

## Global Constraints

- Keep all detections AST-only: no module resolution, type analysis, alias tracing, require analysis, or dynamic-import analysis.
- Support `*` inside a path segment and `**` across path segments; normalise path separators and match configured patterns against absolute linted filenames by path segment.
- Defaults are `bin/**`, `scripts/**`, `cli/**`, `**/main.ts`, `app/api/**/route.ts`, `server/**`, `*.test.ts`, and `*.spec.ts` for `boundaryPaths`.
- `no-process-env-direct-read` adds `configPaths` defaults of `**/config/**`, `**/*Config.ts`, and `**/*ConfigLayer.ts`.
- User-supplied `boundaryPaths` and `configPaths` replace, rather than merge with, defaults.
- Every rule requires direct tests, explicit fixture-config and CLI coverage, valid/invalid fixture evidence, and an `EXPECT`/`QA` anti-pattern example.
- Preserve the existing `recommended = allRules` public contract and update its exact expectation after every registered rule.
- Do not create a changeset in this slice.

---

### Task 1: Shared Path Options And Node Platform Import Rule

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`
- Modify: `tests/config.test.ts`

**Interfaces:**
- Consumes: `OxlintContext.filename`, `OxlintContext.options`, `getImportSource()`, and `report()`.
- Produces: `pathMatchesPattern(filename, pattern)`, `boundaryPathsFor(context)`, `isBoundaryPath(context)`, and registered `linteffect/no-node-platform-in-shared-code`.

- [ ] **Step 1: Extend the direct-rule harness and write failing tests**

Change `runRule()` and `runRuleSequence()` to accept an optional context shape:

```ts
type RuleContextInput = {
  readonly filename?: string;
  readonly options?: readonly unknown[];
};

function runRuleSequence(
  ruleName: string,
  visits: Array<{ visitorName: string; node: unknown }>,
  contextInput: RuleContextInput = {},
): Report[] {
  // Create the visitor with filename defaulting to "/repo/src/domain/order.ts"
  // and options defaulting to [].
}
```

Add `describe("no-node-platform-in-shared-code", ...)` tests that assert:

```ts
const sharedReports = runRule(
  "no-node-platform-in-shared-code",
  "ImportDeclaration",
  importFrom("node:path"),
);
expect(sharedReports).toHaveLength(1);

const serverReports = runRule(
  "no-node-platform-in-shared-code",
  "ImportDeclaration",
  importFrom("node:path"),
  { filename: "/repo/server/http.ts" },
);
expect(serverReports).toHaveLength(0);
```

Also cover a recognised bare built-in (`"fs"`), a non-Node package
(`"node-fetch"`), a `node:*` source on `src/main.ts`, and a custom
`[{ boundaryPaths: ["workers/**"] }]` option allowing
`/repo/workers/entry.ts` while rejecting `/repo/server/http.ts`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
bun test tests/plugin.test.ts --test-name-pattern no-node-platform-in-shared-code
```

Expected: FAIL because the plugin does not export the rule.

- [ ] **Step 3: Add the path helpers and minimal rule**

Add constants and helpers before the rule declarations in `src/index.ts`:

```ts
const defaultBoundaryPaths = [
  "bin/**", "scripts/**", "cli/**", "**/main.ts",
  "app/api/**/route.ts", "server/**", "*.test.ts", "*.spec.ts",
] as const;

function rulePathOptions(context: OxlintContext): Record<string, unknown> {
  const firstOption = context.options[0];
  return typeof firstOption === "object" && firstOption !== null
    ? firstOption as Record<string, unknown>
    : {};
}
```

Implement `stringArrayOption()`, `normalisePath()`, `globToRegExp()`, and
`pathMatchesPattern()` so a pattern beginning with a directory segment matches
that segment at the start of a relative path or after an absolute-path slash.
Use `boundaryPathsFor(context)` to return a valid user array when supplied, or
the defaults otherwise. `isBoundaryPath(context)` tests `context.filename`
against those patterns.

Define an Oxlint rule-options schema for `boundaryPaths` so configured paths
are accepted and invalid values are rejected before rule execution. Do not use
`defaultOptions`: the helper, not the metadata merger, owns the required
replace-defaults behaviour.

```ts
const boundaryPathOptionsSchema = [{
  type: "object",
  properties: {
    boundaryPaths: { type: "array", items: { type: "string" } },
  },
  additionalProperties: false,
}] as const;
```

Add `nodeBuiltinImportSources` containing the Node bare built-ins and an
`isNodeBuiltinImport(source)` predicate that returns true for `node:*` or a
member of that explicit set. Add the rule:

```ts
const noNodePlatformInSharedCode = defineRule({
  meta: { schema: boundaryPathOptionsSchema },
  create(context: OxlintContext) {
    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isNodeBuiltinImport(source) && !isBoundaryPath(context)) {
          report(context, node, "Rule: avoid Node platform imports in shared code. Why: reusable modules must not require a Node runtime. Fix: move the import behind a configured application boundary or an Effect platform service.");
        }
      },
    };
  },
});
```

Register `"no-node-platform-in-shared-code"` in `rules`, add it to
`platformAndBoundaryHygieneRules`, and add
`"linteffect/no-node-platform-in-shared-code": "error"` to the exact
`recommended.rules` expectation and platform group expectation in
`tests/config.test.ts`.

- [ ] **Step 4: Run focused regression tests and verify GREEN**

Run:

```bash
bun test tests/plugin.test.ts --test-name-pattern no-node-platform-in-shared-code
bun test tests/config.test.ts
```

Expected: both commands pass.

- [ ] **Step 5: Commit the completed rule**

```bash
git add src/index.ts tests/plugin.test.ts tests/config.test.ts
git commit -m "Add Node platform boundary rule"
```

### Task 2: Direct Environment Read Rule

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`
- Modify: `tests/config.test.ts`

**Interfaces:**
- Consumes: `isBoundaryPath(context)`, `rulePathOptions(context)`, and the test harness context input from Task 1.
- Produces: `configPathsFor(context)`, `isConfigPath(context)`, and registered `linteffect/no-process-env-direct-read`.

- [ ] **Step 1: Write failing direct-rule tests**

Add `describe("no-process-env-direct-read", ...)` tests using a
`processEnvRead(property?: string, computed = false)` AST factory. Assert one
report for `process.env.DATABASE_URL` in `/repo/src/domain/order.ts`, and no
reports for:

```ts
{ filename: "/repo/server/start.ts" }
{ filename: "/repo/src/config/runtimeConfig.ts" }
{ filename: "/repo/src/RuntimeConfigLayer.ts" }
{ filename: "/repo/packages/env/read.ts", options: [{ configPaths: ["packages/env/**"] }] }
```

Add a computed read (`process.env["DATABASE_URL"]`) diagnostic and an
assignment AST (`process.env.DATABASE_URL = "test"`) that remains unreported.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
bun test tests/plugin.test.ts --test-name-pattern no-process-env-direct-read
```

Expected: FAIL because the plugin does not export the rule.

- [ ] **Step 3: Add the minimal AST-only detection**

Add `defaultConfigPaths`, `configPathsFor(context)`, and `isConfigPath(context)`.
Add helpers that recognise `process.env`, `process.env.NAME`, optional member
forms, and computed members without traversing aliases. Use parent links only
to exclude a member used as the left-hand side of an `AssignmentExpression`.
Define `processEnvPathOptionsSchema` with both string-array properties and use
it as the rule's `meta.schema`; keep defaults in `configPathsFor()` so custom
arrays replace defaults.

Implement:

```ts
const noProcessEnvDirectRead = defineRule({
  meta: { schema: processEnvPathOptionsSchema },
  create(context: OxlintContext) {
    return {
      MemberExpression(node: any) {
        if (
          isProcessEnvRead(node) &&
          !isProcessEnvWriteTarget(node) &&
          !isBoundaryPath(context) &&
          !isConfigPath(context)
        ) {
          report(context, node, "Rule: avoid direct process.env reads outside configuration boundaries. Why: ambient configuration leaks runtime coupling into domain code. Fix: decode environment values in a configured Config service or Layer and depend on that service.");
        }
      },
    };
  },
});
```

Register the rule and update the exact `recommended.rules` and platform-group
expectations in `tests/config.test.ts`.

- [ ] **Step 4: Run focused regression tests and verify GREEN**

Run:

```bash
bun test tests/plugin.test.ts --test-name-pattern no-process-env-direct-read
bun test tests/config.test.ts
```

Expected: both commands pass.

- [ ] **Step 5: Commit the completed rule**

```bash
git add src/index.ts tests/plugin.test.ts tests/config.test.ts
git commit -m "Add environment boundary rule"
```

### Task 3: Hidden Effect Execution Rule

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`
- Modify: `tests/config.test.ts`

**Interfaces:**
- Consumes: `isEffectRunCall()`, `isEffectEcosystemImport()`, `isBoundaryPath(context)`, and `report()`.
- Produces: registered `linteffect/no-hidden-effect-execution`.

- [ ] **Step 1: Write failing direct-rule tests**

Add `describe("no-hidden-effect-execution", ...)` tests using the existing
`effectCall()` factory for `runPromise`, `runSync`, and `runFork`. Collect a
call before the `effect` import and finish with `Program:exit`:

```ts
const reports = runRuleSequence("no-hidden-effect-execution", [
  { visitorName: "CallExpression", node: effectCall("runPromise", identifier("program")) },
  { visitorName: "ImportDeclaration", node: importFrom("effect") },
  { visitorName: "Program:exit", node: {} },
]);
expect(reports).toHaveLength(1);
```

Assert no report for `/repo/bin/cli.ts`, `/repo/server/entry.ts`, a file without
an Effect import, and a custom `boundaryPaths: ["workers/**"]` option.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
bun test tests/plugin.test.ts --test-name-pattern no-hidden-effect-execution
```

Expected: FAIL because the plugin does not export the rule.

- [ ] **Step 3: Collect run candidates and report at program exit**

Implement the rule with final import state rather than an immediate import
gate:

```ts
const noHiddenEffectExecution = defineRule({
  meta: { schema: boundaryPathOptionsSchema },
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const runCalls: unknown[] = [];
    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
      },
      CallExpression(node: any) {
        if (isEffectRunCall(node)) runCalls.push(node);
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport || isBoundaryPath(context)) return;
        for (const node of runCalls) {
          report(context, (node as any).callee, "Rule: avoid hidden Effect execution. Why: Effect.run* fixes runtime ownership inside reusable code. Fix: return the Effect and execute it from a configured application, CLI, worker, route, or test boundary.");
        }
      },
    };
  },
});
```

Register the rule, add it to `platformAndBoundaryHygieneRules`, and update the
exact recommended and group expectations in `tests/config.test.ts`.

- [ ] **Step 4: Run focused regression tests and verify GREEN**

Run:

```bash
bun test tests/plugin.test.ts --test-name-pattern no-hidden-effect-execution
bun test tests/config.test.ts
```

Expected: both commands pass.

- [ ] **Step 5: Commit the completed rule**

```bash
git add src/index.ts tests/plugin.test.ts tests/config.test.ts
git commit -m "Add hidden Effect execution rule"
```

### Task 4: CLI Fixtures, Annotated Examples, And Documentation

**Files:**
- Modify: `tests/fixtures/oxlint/oxlint.config.ts`
- Create: `tests/fixtures/oxlint/platform-boundary-shared.ts`
- Create: `tests/fixtures/oxlint/server/platform-boundary-allowed.ts`
- Create: `tests/fixtures/oxlint/custom-boundary/platform-boundary-allowed.ts`
- Create: `tests/fixtures/oxlint/oxlint.custom-boundary.config.ts`
- Modify: `tests/oxlint.integration.test.ts`
- Modify: `examples/backend/platform-boundary-hygiene-anti-patterns.ts`
- Modify: `README.md`
- Modify: `roadmap/07-platform-and-boundary-hygiene/README.md`

**Interfaces:**
- Consumes: the three registered rules and their documented option shapes.
- Produces: CLI diagnostics and user-facing configuration/anti-pattern documentation for all Slice 2 rules.

- [ ] **Step 1: Add failing CLI assertions and fixture sources**

Add the three rules to the explicit `rules` object in
`tests/fixtures/oxlint/oxlint.config.ts`. Create
`platform-boundary-shared.ts` containing `node:path`,
`process.env.DATABASE_URL`, and `Effect.runPromise`, so one Oxlint invocation
emits all three diagnostics. Create the `server/` fixture with the same shapes
but no diagnostics.

Create `oxlint.custom-boundary.config.ts` with the three rules configured as:

```ts
"linteffect/no-node-platform-in-shared-code": ["error", { boundaryPaths: ["custom-boundary/**"] }],
"linteffect/no-process-env-direct-read": ["error", { boundaryPaths: ["custom-boundary/**"], configPaths: ["custom-boundary/**"] }],
"linteffect/no-hidden-effect-execution": ["error", { boundaryPaths: ["custom-boundary/**"] }],
```

Create its matching `custom-boundary/` fixture. Extend `runOxlint()` to accept
an optional config filename and add CLI tests for shared diagnostics, default
server exemption, and custom-path exemption.

- [ ] **Step 2: Run the focused integration test and verify RED**

Run:

```bash
bun test tests/oxlint.integration.test.ts --test-name-pattern "platform boundary"
```

Expected: FAIL until all three rules and fixture configuration exist.

- [ ] **Step 3: Add annotated examples and public documentation**

Extend `examples/backend/platform-boundary-hygiene-anti-patterns.ts` with an
`EXPECT` and `QA` pair for each rule:

```ts
// EXPECT: linteffect/no-node-platform-in-shared-code
// QA: Shared code must not import Node-only modules directly.
import { join } from "node:path";

// EXPECT: linteffect/no-process-env-direct-read
// QA: Environment values belong in a decoded configuration service or Layer.
const databaseUrl = process.env.DATABASE_URL;

// EXPECT: linteffect/no-hidden-effect-execution
// QA: Runtime execution stays at configured application boundaries.
const result = Effect.runPromise(Effect.succeed("started"));
```

Update the Platform and Boundary Hygiene README table with detection scope and
one `defineConfig` example showing per-rule `boundaryPaths` and `configPaths`.
Update the group roadmap table and Slice 2 checklist to `[x]`, including the
default boundary/config path policy.

- [ ] **Step 4: Run focused integration and verify the expected example diagnostics**

Run:

```bash
bun test tests/oxlint.integration.test.ts --test-name-pattern "platform boundary"
bun test tests/config.test.ts

set +e
bun run lint:examples > /tmp/linteffect-examples.out 2>&1
status=$?
set -e
test "$status" -eq 1
rg 'linteffect\(no-node-platform-in-shared-code\)' /tmp/linteffect-examples.out
rg 'linteffect\(no-process-env-direct-read\)' /tmp/linteffect-examples.out
rg 'linteffect\(no-hidden-effect-execution\)' /tmp/linteffect-examples.out
```

Expected: both test commands pass. `lint:examples` exits 1 because the
repository deliberately contains anti-pattern fixtures; the three required
diagnostics are present in its captured output.

- [ ] **Step 5: Run the complete verification suite**

Run:

```bash
bun run test
bun run typecheck
bun run docs:api:check
bun run build
bun run lint
bun run size
bun run pack:dry-run
git diff --check
```

Expected: every command exits zero.

- [ ] **Step 6: Commit the integration surface**

```bash
git add \
  tests/fixtures/oxlint/oxlint.config.ts \
  tests/fixtures/oxlint/platform-boundary-shared.ts \
  tests/fixtures/oxlint/server/platform-boundary-allowed.ts \
  tests/fixtures/oxlint/custom-boundary/platform-boundary-allowed.ts \
  tests/fixtures/oxlint/oxlint.custom-boundary.config.ts \
  tests/oxlint.integration.test.ts \
  examples/backend/platform-boundary-hygiene-anti-patterns.ts \
  README.md \
  roadmap/07-platform-and-boundary-hygiene/README.md
git commit -m "Document platform boundary hygiene slice 2"
```
