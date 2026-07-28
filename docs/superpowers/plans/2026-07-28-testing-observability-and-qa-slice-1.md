# Testing, Observability And QA Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add conservative observability rules for console calls in Effect flow, contextless error logging, and missing spans on public Effect service operations.

**Architecture:** Reuse the plugin's existing Effect import gating, AST traversal, `Effect.Service` option extraction, and deferred `Program:exit` reporting patterns. Each rule remains syntax-only: it recognises direct Effect APIs and explicit Effect return types, but never resolves aliases, performs type-flow analysis, or relies on paths.

**Tech Stack:** TypeScript, `@oxlint/plugins`, Bun test, Oxlint CLI, TypeDoc, tsdown, publint.

## Global Constraints

- Gate every rule on an Effect ecosystem import.
- Keep all detection local to an AST subtree; skip `parent` fields and use `WeakSet` for recursive traversals.
- Add the three public rules to `recommended` through `allRules` and to a new `testingObservabilityAndQa` group.
- Add `EXPECT` and `QA` annotations for every anti-pattern in `examples/`.
- Do not change dependencies, package version, or release metadata.

---

### Task 1: Detect console calls in Effect flow

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`

**Interfaces:**
- Consumes: `isEffectEcosystemImport`, `isEffectConstructionBoundary`, `containsConsoleCall`, `effectServiceClassOptions`, and `objectPropertyValue` from `src/index.ts`.
- Produces: local helper `consoleCallsInEffectFlow(node: unknown): unknown[]` and rule `noConsoleInEffectFlow`.

- [x] **Step 1: Write failing unit tests for direct Effect-flow and service cases**

  Add a `describe("no-console-in-effect-flow", ...)` block that checks:

  ```ts
  const reports = runRuleSequence("no-console-in-effect-flow", [
    { visitorName: "CallExpression", node: effectCall("sync", arrowCallback(
      blockStatement(expressionStatement(memberCall("console", "error"))),
    )) },
    { visitorName: "ImportDeclaration", node: importFrom("effect") },
    { visitorName: "Program:exit", node: {} },
  ]);
  expect(reports).toHaveLength(1);
  ```

  Cover `Effect.gen`, an `Effect.Service` `effect` option, top-level console
  calls in an Effect module, and non-Effect modules. Assert diagnostic text
  directs users to `Effect.log*`.

- [x] **Step 2: Run the focused test to verify it fails**

  Run: `bun test tests/plugin.test.ts --test-name-pattern "no-console-in-effect-flow"`

  Expected: FAIL because `no-console-in-effect-flow` is not exported.

- [x] **Step 3: Implement minimal local detection and rule registration**

  Add `consoleCallsInEffectFlow` that:

  ```ts
  function consoleCallsInEffectFlow(node: unknown): unknown[] {
    if (isEffectConstructionBoundary(node)) {
      return findNodes((node as Node).arguments, isConsoleCall);
    }
    const options = effectServiceClassOptions(node);
    return options
      ? findNodes(
          objectPropertyValue(options, "effect") ?? objectPropertyValue(options, "scoped"),
          isConsoleCall,
        )
      : [];
  }
  ```

  Implement a deferred rule with `CallExpression` and `ClassDeclaration`
  candidates, set `hasEffectEcosystemImport` from imports, and report every
  matching console call at `Program:exit`. Register the rule in `rules` only;
  public grouping is completed in Task 4.

- [x] **Step 4: Run the focused test to verify it passes**

  Run: `bun test tests/plugin.test.ts --test-name-pattern "no-console-in-effect-flow"`

  Expected: PASS for Effect construction and service implementation reports;
  top-level and non-Effect cases remain clean.

- [x] **Step 5: Commit the isolated rule**

  ```bash
  git add src/index.ts tests/plugin.test.ts
  git commit -m "Add Effect console observability rule"
  ```

### Task 2: Detect contextless error logging

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`

**Interfaces:**
- Consumes: `isEffectMemberCallNamed`, `firstArgument`, `callbackBody`, `findNode`, `objectPropertyValue`, and `effectServiceClassOptions`.
- Produces: `isStaticLogMessage`, `hasStructuredLogContext`, `contextlessErrorLogs`, and rule `noEffectLogWithoutStructuredContext`.

- [x] **Step 1: Write failing unit tests for error handlers and service implementations**

  Add a `describe("no-effect-log-without-structured-context", ...)` block that
  proves a direct handler report:

  ```ts
  const handler = arrowCallback(effectCall("logError", stringLiteral("save failed")));
  const reports = runRuleSequence("no-effect-log-without-structured-context", [
    { visitorName: "CallExpression", node: effectCall("catchAll", identifier("program"), handler) },
    { visitorName: "ImportDeclaration", node: importFrom("effect") },
    { visitorName: "Program:exit", node: {} },
  ]);
  expect(reports).toHaveLength(1);
  ```

  Cover `logWarning`, `catchTag`, `catchTags`, `tapError`, a service
  implementation, `Effect.logInfo`, an object/error second argument, a local
  `Effect.annotateLogs({ requestId })`, and non-Effect modules.

- [x] **Step 2: Run the focused test to verify it fails**

  Run: `bun test tests/plugin.test.ts --test-name-pattern "no-effect-log-without-structured-context"`

  Expected: FAIL because the rule is not exported.

- [x] **Step 3: Implement syntax-only handler and context checks**

  Define the exact handler set:

  ```ts
  const errorHandlingOperators = new Set([
    "catchAll", "catchTag", "catchTags", "tapError",
  ]);
  ```

  `isStaticLogMessage` returns true only for `Literal` strings and
  `TemplateLiteral` values. `hasStructuredLogContext` returns true when the
  candidate subtree contains `Effect.annotateLogs(...)`, or when the log call
  has more than one argument and one later argument is an object or a
  non-string value. Scan direct error-handler callback bodies and `effect` /
  `scoped` service implementations, collect the contextless `logError` /
  `logWarning` calls, and report after imports are known.

- [x] **Step 4: Run the focused test to verify it passes**

  Run: `bun test tests/plugin.test.ts --test-name-pattern "no-effect-log-without-structured-context"`

  Expected: PASS; only one-message warning/error logs in the defined local
  contexts report, including each matching log call in one handler subtree.

- [x] **Step 5: Commit the isolated rule**

  ```bash
  git add src/index.ts tests/plugin.test.ts
  git commit -m "Add structured Effect logging rule"
  ```

### Task 3: Require spans on public Effect operations

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/plugin.test.ts`

**Interfaces:**
- Consumes: `returnTypeAnnotation`, `isQualifiedTypeReference`, `typeArguments`, `effectServiceClassOptions`, `objectPropertyValue`, and `pipeParts`.
- Produces: `hasExplicitEffectReturnType`, `returnedEffectExpression`, `containsDirectEffectSpan`, `publicEffectOperationWithoutSpan`, and rule `requireSpanOnPublicServiceMethod`.

- [x] **Step 1: Write failing unit tests for exported functions and service methods**

  Add a `describe("require-span-on-public-service-method", ...)` block that
  checks an exported explicit Effect return without a span:

  ```ts
  const reports = runRuleSequence("require-span-on-public-service-method", [
    { visitorName: "ImportDeclaration", node: importFrom("effect") },
    {
      visitorName: "ExportNamedDeclaration",
      node: exportedFunctionDeclarationReturningType(
        effectEffectTypeReference(identifier("User"), identifier("LoadError"), identifier("never")),
      ),
    },
    { visitorName: "Program:exit", node: {} },
  ]);
  expect(reports).toHaveLength(1);
  ```

  Cover exported arrow functions, a span pipe pass case, data-first
  `Effect.withSpan(program, "service.operation")`, untyped exports, non-Effect
  exports, service object methods returning `Effect.succeed`, and service
  methods whose returned Effect is span-wrapped.

- [x] **Step 2: Run the focused test to verify it fails**

  Run: `bun test tests/plugin.test.ts --test-name-pattern "require-span-on-public-service-method"`

  Expected: FAIL because the rule is not exported.

- [x] **Step 3: Implement explicit-return and service-method span checks**

  Implement `hasExplicitEffectReturnType` with
  `isQualifiedTypeReference(returnTypeAnnotation(node), "Effect", "Effect")`.
  For export declarations, inspect function declarations and function-valued
  variable declarators. For Effect.Service options, find functions on the
  object returned from its `effect` or `scoped` implementation, then inspect
  direct return expressions that are `isEffectMemberCall` or
  `isPipeStartingWithEffect`.

  `containsDirectEffectSpan` accepts only:

  ```ts
  isEffectMemberCallNamed(expression, "withSpan")
  // or a pipe part that is Effect.withSpan(...)
  ```

  Report each operation lacking one of those forms after imports are known.

- [x] **Step 4: Run the focused test to verify it passes**

  Run: `bun test tests/plugin.test.ts --test-name-pattern "require-span-on-public-service-method"`

  Expected: PASS; explicit exported and service Effect operations without
  spans report, while span-wrapped and out-of-scope shapes remain clean.

- [x] **Step 5: Commit the isolated rule**

  ```bash
  git add src/index.ts tests/plugin.test.ts
  git commit -m "Require spans on public Effect operations"
  ```

### Task 4: Export, demonstrate, document, and verify the group

**Files:**
- Modify: `src/index.ts`
- Modify: `tests/config.test.ts`
- Modify: `tests/fixtures/oxlint/oxlint.config.ts`
- Create: `tests/fixtures/oxlint/oxlint.observability.config.ts`
- Create: `tests/fixtures/oxlint/observability-invalid.ts`
- Create: `tests/fixtures/oxlint/observability-valid.ts`
- Modify: `tests/oxlint.integration.test.ts`
- Create: `examples/backend/testing-observability-and-qa-anti-patterns.ts`
- Modify: `README.md`
- Modify: `roadmap/08-testing-observability-and-qa/README.md`

**Interfaces:**
- Consumes: the three rules from Tasks 1-3.
- Produces: `testingObservabilityAndQaRules`, `testingObservabilityAndQa`, a
  `ruleGroups.testingObservabilityAndQa` entry, and public docs/examples.

- [ ] **Step 1: Write failing config and CLI contract tests**

  Extend `groupExpectations` with:

  ```ts
  testingObservabilityAndQa: [
    "no-console-in-effect-flow",
    "no-effect-log-without-structured-context",
    "require-span-on-public-service-method",
  ],
  ```

  Add CLI assertions that `observability-invalid.ts` returns exactly the three
  rule IDs and `observability-valid.ts` returns status zero under the dedicated
  config. Run both test files before the public exports/fixtures exist.

- [ ] **Step 2: Run the config and CLI tests to verify they fail**

  Run: `bun test tests/config.test.ts`

  Run: `bun test tests/oxlint.integration.test.ts --test-name-pattern "observability"`

  Expected: FAIL because the group export and fixtures are absent.

- [ ] **Step 3: Add exports, fixtures, examples, documentation, and roadmap updates**

  Add this exact group to `src/index.ts`:

  ```ts
  export const testingObservabilityAndQaRules = rulesFromNames([
    "no-console-in-effect-flow",
    "no-effect-log-without-structured-context",
    "require-span-on-public-service-method",
  ] as const);
  export const testingObservabilityAndQa = presetFor(testingObservabilityAndQaRules);
  ```

  Include it in `ruleGroups`, exported group/preset maps, config imports and
  expectations, and add all three IDs to the exact `recommended.rules`
  expectation; keep `recommended` automatic via `allRules`. Create a
  dedicated CLI config that enables only the three rules. The invalid fixture
  must produce all three diagnostics; the valid fixture must use `Effect.log*`
  rather than `console`, structured error logging, and direct spans. Add one
  annotated backend anti-pattern for each rule. Document the exact syntactic
  limits in the README and mark all Roadmap 08 Slice 1 entries complete.

- [ ] **Step 4: Run focused public-surface and example checks**

  Run: `bun test tests/config.test.ts`

  Run: `bun test tests/oxlint.integration.test.ts --test-name-pattern "observability"`

  Run: `bun run lint:examples`

  Expected: config and CLI tests PASS. The example command exits 1 and visibly
  includes all three new `linteffect(...)` IDs.

- [ ] **Step 5: Run the full package verification gate**

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

  Expected: every command exits zero. `lint:examples` remains intentionally
  non-zero and is not part of the clean package gate.

- [ ] **Step 6: Commit the public surface and verification state**

  ```bash
  git add src/index.ts tests/config.test.ts tests/fixtures/oxlint \
    tests/oxlint.integration.test.ts examples/backend/testing-observability-and-qa-anti-patterns.ts \
    README.md roadmap/08-testing-observability-and-qa/README.md \
    docs/superpowers/plans/2026-07-28-testing-observability-and-qa-slice-1.md
  git commit -m "Document testing observability slice 1"
  ```

## Plan Review

- [x] Spec coverage: Tasks 1-3 implement the three detection contracts; Task 4 provides public exports, fixtures, examples, documentation, and roadmap completion.
- [x] Placeholder scan: every task includes concrete files, helper names, test cases, commands, and commit boundaries.
- [x] Type consistency: the group names are consistently `testingObservabilityAndQaRules` and `testingObservabilityAndQa`; all rules use the agreed public IDs.
