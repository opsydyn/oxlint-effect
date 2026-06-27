# Lint QA Examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lint-only `examples/` QA corpus with annotated anti-pattern snippets for every exported `linteffect` rule.

**Architecture:** The examples are intentionally invalid TypeScript/TSX files grouped by frontend, backend, and shared boundary contexts. A local Oxlint config loads `../src/index.ts`, and `bun run lint:examples` provides the feedback loop between `EXPECT` annotations and observed diagnostics.

**Tech Stack:** Bun, Oxlint, TypeScript, TSX, local `@oxlint/plugins` JavaScript plugin loading.

---

## File Structure

- Create: `examples/README.md`
  - Explains that the examples are intentionally lint-dirty and not runnable.
  - Documents the `EXPECT: linteffect/<rule>` annotation contract.
  - Gives commands for observing and comparing diagnostics.
- Create: `examples/oxlint.config.ts`
  - Imports `defineConfig` from `oxlint`.
  - Imports `allRules` from `../src/index`.
  - Loads the local plugin through `jsPlugins`.
- Create: `examples/frontend/react-anti-patterns.tsx`
  - Contains React, render, and atom examples.
  - Covers `no-react-state`, `no-render-side-effects`, `no-atom-registry-effect-sync`, `no-family-collection-read`, and frontend-friendly flow rules.
- Create: `examples/backend/effect-anti-patterns.ts`
  - Contains backend/service Effect examples.
  - Covers Effect combinator, runtime, branching, callback, wrapper, GraphQL, and object-state rules.
- Create: `examples/shared/type-boundary-anti-patterns.ts`
  - Contains type/model/Option/sentinel examples.
  - Covers Effect type aliases, model casts, Option normalization, boolean coercion, and string sentinel rules.
- Modify: `package.json`
  - Add `lint:examples`.
- Modify: `.gitignore`
  - Preserve the existing local reference ignore for `effect-smol-main 2/` if still present.
- Create: `.changeset/lint-qa-examples.md`
  - Empty changeset because this is a QA/docs/script addition rather than package runtime behavior.

---

### Task 1: Add Example Oxlint Config and Package Script

**Files:**
- Create: `examples/oxlint.config.ts`
- Modify: `package.json`
- Create: `.changeset/lint-qa-examples.md`
- Modify: `.gitignore`

- [ ] **Step 1: Create the examples config**

Create `examples/oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";
import { allRules } from "../src/index";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [
    {
      name: "linteffect",
      specifier: "../src/index.ts",
    },
  ],
  rules: allRules,
});
```

- [ ] **Step 2: Add the examples lint script**

Modify the `scripts` object in `package.json` so it contains this new entry next to the existing lint scripts:

```json
"lint:examples": "oxlint --config examples/oxlint.config.ts examples"
```

Keep the existing `lint`, `prelint`, `test`, `typecheck`, and release scripts unchanged.

- [ ] **Step 3: Add an empty changeset**

Create `.changeset/lint-qa-examples.md`:

```md
---
---

Add lint-only QA examples for observing linteffect diagnostics.
```

- [ ] **Step 4: Preserve the local reference ignore**

If `.gitignore` still has the unstaged `effect-smol-main 2/` line, keep it. If it is missing, add it below the existing `biome-effect-linting-rules-master/` line:

```gitignore
effect-smol-main 2/
```

- [ ] **Step 5: Verify config loads without example files**

Run:

```bash
bun run lint:examples
```

Expected: fail because `examples/` has no lintable source yet, or exit with no diagnostics if only `oxlint.config.ts` exists. This step only checks that the script and config are syntactically valid enough to invoke Oxlint.

- [ ] **Step 6: Commit setup**

```bash
git add package.json .changeset/lint-qa-examples.md .gitignore examples/oxlint.config.ts
git commit -m "Add examples lint harness"
```

---

### Task 2: Add Frontend QA Examples

**Files:**
- Create: `examples/frontend/react-anti-patterns.tsx`

- [ ] **Step 1: Create the frontend anti-pattern file**

Create `examples/frontend/react-anti-patterns.tsx` with this content:

```tsx
import { Effect, Match } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { useState } from "react";

declare const UsersCollectionAtom: unknown;
declare const ThemeAtom: unknown;
declare function get(atom: unknown): unknown;
declare function setState(value: unknown): void;
declare function renderMetric(value: unknown): JSX.Element;

export function DashboardPanel() {
  // EXPECT: linteffect/no-react-state
  // QA: React state hooks should warn in Effect/atom driven UI code.
  const [count] = useState(0);

  // EXPECT: linteffect/no-render-side-effects
  // QA: Match.value(...).pipe(...) used as a render statement should warn.
  Match.value(count).pipe(
    Match.when(0, () => Effect.succeed("empty")),
    Match.orElse(() => Effect.succeed("ready")),
  );

  // EXPECT: linteffect/no-atom-registry-effect-sync
  // QA: Atom operations wrapped in Effect.sync should warn.
  const syncAtomWrite = Effect.sync(() => Atom.set(ThemeAtom, count));

  // EXPECT: linteffect/no-family-collection-read
  // QA: Atom.family should not read broad collection atoms from keyed projections.
  const userFamily = Atom.family((id: string) => get(UsersCollectionAtom));

  // EXPECT: linteffect/no-if-statement
  // QA: The Effect ecosystem import gates imperative if-statement warnings.
  if (count > 0) {
    setState(count);
  }

  // EXPECT: linteffect/no-ternary
  // QA: Ternary expressions in Effect ecosystem files should warn.
  const label = count > 0 ? "active" : "idle";

  // EXPECT: linteffect/no-branch-in-object
  // QA: Match branches inside object literals should warn.
  const viewModel = {
    label: Match.value(label).pipe(Match.orElse((value) => value)),
  };

  return (
    <section>
      {renderMetric(viewModel.label)}
      {renderMetric(syncAtomWrite)}
      {renderMetric(userFamily)}
    </section>
  );
}
```

- [ ] **Step 2: Run the frontend lint observation**

Run:

```bash
bun run lint:examples > /tmp/linteffect-examples-frontend.log 2>&1; rc=$?; tail -80 /tmp/linteffect-examples-frontend.log; test "$rc" -eq 1
```

Expected: exit 0 from the final `test "$rc" -eq 1`, with diagnostics containing:

```text
linteffect(no-react-state)
linteffect(no-render-side-effects)
linteffect(no-atom-registry-effect-sync)
linteffect(no-family-collection-read)
linteffect(no-if-statement)
linteffect(no-ternary)
linteffect(no-branch-in-object)
```

- [ ] **Step 3: Commit frontend examples**

```bash
git add examples/frontend/react-anti-patterns.tsx
git commit -m "Add frontend lint QA examples"
```

---

### Task 3: Add Backend Effect QA Examples

**Files:**
- Create: `examples/backend/effect-anti-patterns.ts`

- [ ] **Step 1: Create the backend anti-pattern file**

Create `examples/backend/effect-anti-patterns.ts` with this content:

```ts
import { Effect, Match, Option, Ref, Runtime, pipe } from "effect";

declare const count: number;
declare const applyResponse: (value: unknown) => unknown;
declare const SomeRuntime: { pipe: (...args: Array<unknown>) => unknown };
declare const SomeRuntimeLive: unknown;
declare function wrapGraphqlCall(input: unknown): unknown;
declare function invalidate(key: string): void;
declare function setState(value: unknown): void;

// EXPECT: linteffect/no-switch-statement
// QA: Switch statements in Effect files should warn.
switch (count) {
  case 0:
    break;
  default:
    break;
}

// EXPECT: linteffect/no-effect-as
// QA: Effect.as wrappers should warn.
const asWrapper = Effect.as(Effect.succeed(count), "done");

// EXPECT: linteffect/no-effect-do
// QA: Effect.Do member access should warn.
const builderState = Effect.Do;

// EXPECT: linteffect/no-effect-bind
// QA: Effect.bind should warn.
const boundProgram = Effect.bind("next", () => Effect.succeed(count));

// EXPECT: linteffect/no-runtime-runfork
// QA: Runtime.runFork should warn.
Runtime.runFork(asWrapper);

// EXPECT: linteffect/no-effect-async
// QA: Manual Effect.async bridges should warn.
const callbackBridge = Effect.async<never, never, void>(() => {});

// EXPECT: linteffect/prevent-dynamic-imports
// QA: Dynamic imports should warn.
const lazyModule = import("./lazy-service");

// EXPECT: linteffect/no-nested-effect-call
// QA: Deep nested Effect calls should warn.
const nestedCall = Effect.map(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => value,
);

// EXPECT: linteffect/no-effect-ladder
// QA: Deep nested Effect combinators assigned to const should warn.
const effectLadder = Effect.map(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => value,
);

// EXPECT: linteffect/no-flatmap-ladder
// QA: Nested Effect.flatMap ladders should warn.
const flatMapLadder = Effect.flatMap(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => Effect.succeed(value),
);

// EXPECT: linteffect/no-pipe-ladder
// QA: Nested pipe calls should warn.
const pipeLadder = pipe(count, pipe(count, (value) => value));

// EXPECT: linteffect/no-call-tower
// QA: Nested Effect call towers should warn.
const callTower = Effect.zipRight(
  Effect.succeed(count),
  Effect.succeed("next"),
);

// EXPECT: linteffect/no-effect-orElse-ladder
// QA: Effect.orElse around sequencing chains should warn.
const orElseLadder = Effect.orElse(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  () => Effect.succeed("fallback"),
);

// EXPECT: linteffect/no-return-null
// QA: Returning null in Effect ecosystem files should warn.
export function missingValue() {
  return null;
}

// EXPECT: linteffect/no-option-as
// QA: Option.as should warn.
const optionAs = Option.as(Option.some(count), "value");

// EXPECT: linteffect/no-effect-never
// QA: Effect.never should warn.
const neverProgram = Effect.never;

// EXPECT: linteffect/no-arrow-ladder
// QA: Nested arrow IIFEs in Effect files should warn.
const arrowLadder = ((value: number) => ((next: number) => next)(value))(count);

// EXPECT: linteffect/no-iife-wrapper
// QA: Inline function IIFEs in Effect files should warn.
const iifeWrapper = ((value: number) => value)(count);

// EXPECT: linteffect/no-return-in-arrow
// QA: Returns inside block-bodied arrow callbacks should warn.
const arrowReturn = pipe(
  count,
  (value) => {
    return value;
  },
);

// EXPECT: linteffect/no-return-in-callback
// QA: Returns inside inline function callbacks should warn.
const callbackReturn = [count].map(function callback(value) {
  return value;
});

// EXPECT: linteffect/no-effect-fn-generator
// QA: Effect.fn generator wrappers should warn.
const fnGenerator = Effect.fn(function* () {
  return yield* Effect.succeed(count);
});

// EXPECT: linteffect/no-effect-sync-console
// QA: console calls inside Effect.sync should warn.
const syncConsole = Effect.sync(() => {
  console.log(count);
});

// EXPECT: linteffect/no-nested-effect-gen
// QA: Nested Effect.gen calls should warn.
const nestedGen = Effect.gen(function* () {
  return yield* Effect.gen(function* () {
    return count;
  });
});

// EXPECT: linteffect/no-match-void-branch
// QA: Match branches returning Effect.void should warn.
const matchVoidBranch = Match.when(true, () => Effect.void);

// EXPECT: linteffect/no-match-effect-branch
// QA: Sequencing inside Match branches should warn.
const matchEffectBranch = Match.value(count).pipe(
  Match.when(1, () => Effect.flatMap(Effect.succeed(count), (value) => Effect.succeed(value))),
);

// EXPECT: linteffect/warn-effect-sync-wrapper
// QA: Expression-bodied Effect.sync wrappers should warn.
const syncWrapper = Effect.sync(() => String(count));

// EXPECT: linteffect/no-effect-side-effect-wrapper
// QA: Effect.as around side effects should warn.
const sideEffectWrapper = Effect.as(console.log(count), "done");

// EXPECT: linteffect/no-effect-all-step-sequencing
// QA: Effect.all with sequential side-effect steps should warn.
const allStepSequencing = Effect.all([
  Ref.set({} as any, count),
], { concurrency: 1 });

// EXPECT: linteffect/no-try-catch
// QA: try/catch in Effect files should warn.
try {
  throw new Error("boom");
} catch {
  console.log("handled");
}

// EXPECT: linteffect/no-effect-wrapper-alias
// QA: Functions returning raw Effect wrappers should warn.
export function wrapperAlias() {
  return Effect.succeed(count);
}

// EXPECT: linteffect/no-wrapgraphql-catchall
// QA: catchAll after wrapGraphqlCall/applyResponse should warn.
const graphqlCatchAll = pipe(
  wrapGraphqlCall({ query: "query" }),
  Effect.catchAll(() => Effect.succeed(count)),
);

// EXPECT: linteffect/no-inline-runtime-provide
// QA: Inline runtime provisioning inside local Effect code should warn.
const inlineRuntimeProvide = Effect.gen(function* () {
  return yield* SomeRuntime.pipe(Effect.provide(SomeRuntimeLive));
});

// EXPECT: linteffect/no-naked-object-state-update
// QA: Raw object spread state patching should warn.
const objectStatePatch = Ref.update({} as any, (state) => ({
  ...state,
  count,
}));

// EXPECT: linteffect/no-effect-succeed-variable
// QA: Effect.succeed(variable) branch placeholders should warn.
const succeedVariable = Effect.succeed(count);

// Keep declarations referenced so parse-only examples look intentional.
void [
  builderState,
  boundProgram,
  callbackBridge,
  lazyModule,
  nestedCall,
  effectLadder,
  flatMapLadder,
  pipeLadder,
  callTower,
  orElseLadder,
  optionAs,
  neverProgram,
  arrowLadder,
  iifeWrapper,
  arrowReturn,
  callbackReturn,
  fnGenerator,
  syncConsole,
  nestedGen,
  matchVoidBranch,
  matchEffectBranch,
  syncWrapper,
  sideEffectWrapper,
  allStepSequencing,
  wrapperAlias,
  graphqlCatchAll,
  inlineRuntimeProvide,
  objectStatePatch,
  succeedVariable,
  applyResponse,
  invalidate,
  setState,
];
```

- [ ] **Step 2: Run the backend lint observation**

Run:

```bash
bun run lint:examples > /tmp/linteffect-examples-backend.log 2>&1; rc=$?; tail -120 /tmp/linteffect-examples-backend.log; test "$rc" -eq 1
```

Expected: exit 0 from the final `test "$rc" -eq 1`, with diagnostics containing at least the backend `EXPECT` rules from this task.

- [ ] **Step 3: Commit backend examples**

```bash
git add examples/backend/effect-anti-patterns.ts
git commit -m "Add backend lint QA examples"
```

---

### Task 4: Add Shared Type Boundary QA Examples

**Files:**
- Create: `examples/shared/type-boundary-anti-patterns.ts`

- [ ] **Step 1: Create the shared anti-pattern file**

Create `examples/shared/type-boundary-anti-patterns.ts` with this content:

```ts
import { Effect, Match, Option } from "effect";

declare const count: number;
declare const decoded: unknown;
declare const source: string | null | undefined;
declare const unknownFlag: unknown;

// EXPECT: linteffect/no-manual-effect-channels
// QA: Manual Effect channel tuple types should warn.
type ManualEffect = Effect.Effect<number, Error, never>;

// EXPECT: linteffect/no-effect-type-alias
// QA: Effect.Effect type aliases should warn.
type ProgramAlias = Effect.Effect<string, Error, never>;

// EXPECT: linteffect/no-model-overlay-cast
// QA: Asserting decoded model flow with `as` should warn.
const modelOverlay = decoded as { readonly id: string };

// EXPECT: linteffect/no-unknown-boolean-coercion-helper
// QA: Local unknown-to-boolean coercion helpers paired with Match.orElse null should warn.
const booleanCoercion = Match.value(typeof unknownFlag === "boolean").pipe(
  Match.orElse(() => null),
);

// EXPECT: linteffect/no-fromnullable-nullish-coalesce
// QA: Nullish re-wrap inside Option.fromNullable should warn.
const nullableOption = Option.fromNullable(source ?? null);

// EXPECT: linteffect/no-option-boolean-normalization
// QA: Repeated Option boolean normalization should warn.
const booleanNormalized = Option.match(Option.some(count), {
  onSome: (value) => value === true,
  onNone: () => false,
});

// EXPECT: linteffect/no-string-sentinel-return
// QA: Effect.succeed string sentinels should warn.
const stringSentinelReturn = Effect.succeed("loading");

// EXPECT: linteffect/no-string-sentinel-const
// QA: String status constants should warn.
const statusToken = "loading";

void [
  booleanCoercion,
  nullableOption,
  booleanNormalized,
  stringSentinelReturn,
  statusToken,
  modelOverlay,
];
```

- [ ] **Step 2: Run the shared lint observation**

Run:

```bash
bun run lint:examples > /tmp/linteffect-examples-shared.log 2>&1; rc=$?; tail -120 /tmp/linteffect-examples-shared.log; test "$rc" -eq 1
```

Expected: exit 0 from the final `test "$rc" -eq 1`, with diagnostics containing the shared `EXPECT` rules from this task.

- [ ] **Step 3: Commit shared examples**

```bash
git add examples/shared/type-boundary-anti-patterns.ts
git commit -m "Add type boundary lint QA examples"
```

---

### Task 5: Add Examples README and Coverage Checks

**Files:**
- Create: `examples/README.md`

- [ ] **Step 1: Create the examples README**

Create `examples/README.md`:

````md
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

The final `comm` command should print no lines.
````

- [ ] **Step 2: Verify every exported rule has an annotation**

Run:

```bash
rg -o '"linteffect/[^"]+": "error"' src/index.ts \
  | sed 's/"//g; s/: error//' \
  | sort -u > /tmp/linteffect-exported.txt
rg -o 'EXPECT: linteffect/[a-zA-Z0-9-]+' examples \
  | sed 's/.*EXPECT: //' \
  | sort -u > /tmp/linteffect-expected.txt
comm -23 /tmp/linteffect-exported.txt /tmp/linteffect-expected.txt
```

Expected: no output. If `src/index.ts` export extraction returns no rules because `allRules` is generated dynamically, use this command instead:

```bash
rg -o '"[a-zA-Z0-9-]+": [a-zA-Z0-9]+' src/index.ts \
  | sed 's/"//; s/":.*//; s/^/linteffect\//' \
  | sort -u > /tmp/linteffect-exported.txt
comm -23 /tmp/linteffect-exported.txt /tmp/linteffect-expected.txt
```

- [ ] **Step 3: Commit docs**

```bash
git add examples/README.md
git commit -m "Document lint QA examples"
```

---

### Task 6: Verify Observed Diagnostics and Repo Gates

**Files:**
- Do not create files in this task; edit only the `examples/` files if the feedback-loop check exposes a snippet mismatch.
- Modify examples only if an annotation does not produce the expected diagnostic.

- [ ] **Step 1: Run the full examples feedback-loop check**

Run:

```bash
rg -o 'EXPECT: linteffect/[a-zA-Z0-9-]+' examples \
  | sed 's/.*EXPECT: //' \
  | sort -u > /tmp/linteffect-expected.txt

bun run lint:examples > /tmp/linteffect-observed.log 2>&1; rc=$?; test "$rc" -eq 1

rg -o 'linteffect\([^)]+\)' /tmp/linteffect-observed.log \
  | sed 's/linteffect(/linteffect\//; s/)//' \
  | sort -u > /tmp/linteffect-observed.txt

comm -23 /tmp/linteffect-expected.txt /tmp/linteffect-observed.txt
```

Expected: the final `comm` command prints no lines. If it prints a rule ID, inspect that snippet first; only change `src/index.ts` if the snippet matches the intended trigger and the rule truly fails.

- [ ] **Step 2: Confirm examples stay out of the published package**

Run:

```bash
bun run pack:dry-run > /tmp/linteffect-pack.log 2>&1; rc=$?; cat /tmp/linteffect-pack.log; test "$rc" -eq 0; ! rg 'examples/' /tmp/linteffect-pack.log
```

Expected: pack dry run succeeds and the `examples/` path is absent from the tarball contents.

- [ ] **Step 3: Run existing repo gates**

Run:

```bash
bun run test
bun run typecheck
bun run build
bun run lint
bun run docs:api:check
bun run size
bun run changeset status --since=HEAD
git diff --check
```

Expected:
- Tests pass with the existing plugin/config/Oxlint integration suite.
- Typecheck exits 0.
- Build emits `dist/index.mjs` and `dist/index.d.mts`.
- Publint reports `All good!`.
- Typedoc check exits 0.
- Size limit remains under 20 KB.
- Changesets status passes because the empty changeset is present.
- `git diff --check` exits 0.

- [ ] **Step 4: Commit final verification adjustments**

If Task 6 required any example corrections, commit them:

```bash
git add examples package.json .changeset/lint-qa-examples.md .gitignore
git commit -m "Stabilize lint QA examples"
```

If there are no corrections, do not create an empty commit.
