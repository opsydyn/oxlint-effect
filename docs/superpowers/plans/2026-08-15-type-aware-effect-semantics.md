# Opt-In Type-Aware Effect Semantics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a consumer-owned, opt-in `typeAware` Oxlint preset with pack-backed QA, complete configuration/failure documentation, and a dedicated CI gate without changing the existing recommended rule behaviour.

**Architecture:** Keep `@opsydyn/oxlint-effect` as a syntax-only Oxlint JavaScript plugin. Add a config-shaped `typeAware` export that sets only `options.typeAware: true`, reuses the existing recommended rules, and preserves the readonly plugin tuple. Prove the published package boundary through an isolated consumer copied to a temporary directory and installed from a locally packed tarball; defer custom semantic Effect rules until Oxlint exposes a supported typed-plugin API.

**Tech Stack:** TypeScript, Bun, Oxlint, `@oxlint/plugins`, `oxlint-tsgolint@7.0.2001`, TypeScript `7.0.2` in the typed consumer, Vitest-compatible Bun tests, TypeDoc, Changesets, GitHub Actions.

## Global Constraints

- `recommended` remains behaviourally unchanged.
- Existing rule implementations, rule IDs, group presets, `allRules`, and the default plugin registration remain unchanged.
- The new `typeAware` preset sets `options.typeAware: true` and does not set `options.typeCheck`.
- The new `typeAware` preset does not enable any `typescript/*` rules; the consumer fixture selects `typescript/no-floating-promises` and `typescript/no-misused-promises` explicitly.
- `oxlint-tsgolint` is consumer-owned and is not added to the root package dependencies or peer dependencies.
- The readonly `jsPlugins` tuple is always spread when passed to Oxlint's mutable `ExternalPluginEntry[]` configuration field.
- Valid controls run under the complete `typeAware` ruleset without file-local overrides; a pipe/map control is an expression statement rather than an exported Effect wrapper alias because `no-effect-wrapper-alias` intentionally rejects that alias shape.
- Custom type-aware Effect rules are out of scope until Oxlint exposes resolved TypeScript types/symbols to custom JavaScript plugin rules through a supported API.
- Intentional anti-pattern examples remain unfixed and are validated by expected-versus-observed diagnostic IDs.
- Type-aware setup failures are documented by failure class; tests must not depend on unstable diagnostic wording.
- The ordinary root test and quality gates must not depend on a consumer's `oxlint-tsgolint` installation.
- Use the existing single-file `src/index.ts` rule/export architecture; do not perform an unrelated source split.
- Use the existing `bun test ./tests/*.test.ts` test discovery contract.

---

## File and Responsibility Map

- Modify `src/index.ts` near `presetFor`, `recommended`, and `presets` to export the new config object.
- Modify `tests/config.test.ts` to assert the exact `typeAware` shape and preserve all existing preset assertions.
- Create `examples/type-aware-consumer/package.json` as an isolated consumer dependency boundary.
- Create `examples/type-aware-consumer/oxlint.config.ts` as the runnable type-aware consumer configuration.
- Create `examples/type-aware-consumer/tsconfig.json` as the scoped TypeScript project configuration.
- Create `examples/type-aware-consumer/src/effect-syntax-failures.ts` for existing `linteffect/*` failures.
- Create `examples/type-aware-consumer/src/type-aware-failures.ts` for explicit built-in `typescript/*` failures.
- Create `examples/type-aware-consumer/src/valid-controls.ts` for no-diagnostic controls.
- Create `examples/type-aware-consumer/failure-modes/README.md` for missing-engine, config, declaration, nested-config, and `typeCheck` failure examples.
- Create `examples/type-aware-consumer/README.md` for installation, all config variants, and expected lint behaviour.
- Create `scripts/verify-type-aware-consumer.ts` for temporary packed-artifact installation and expected diagnostic comparison.
- Modify `package.json` to add the dedicated `test:type-aware` script without adding a root tsgolint dependency.
- Modify `README.md` to document `recommended`, `typeAware`, group/rule-only composition, CLI activation, built-in typed rule selection, and `typeCheck` separation.
- Modify `examples/README.md` to index the type-aware consumer and its failure corpus.
- Create `roadmap/13-type-aware-effect-semantics/README.md` to track the delivered bridge and deferred semantic rule gate.
- Modify `.github/workflows/ci.yml` to add a separate typed consumer job.
- Create `.changeset/type-aware-preset.md` for the additive minor release.

## Implementation Tasks

### Task 1: Add the opt-in preset and configuration contract

**Files:**
- Modify: `src/index.ts:10079-10376`
- Modify: `tests/config.test.ts:1-480`

**Interfaces:**
- Consumes: existing `jsPlugins`, `recommended`, `recommendedRules`, and `presets` exports.
- Produces: `typeAware` with the inferred readonly shape:

```ts
{
  readonly options: { readonly typeAware: true };
  readonly jsPlugins: typeof jsPlugins;
  readonly rules: typeof recommended.rules;
}
```

- Produces: `presets.typeAware` pointing to the same config object.

- [ ] **Step 1: Extend the config test with the failing public contract**

Update the import list in `tests/config.test.ts` to include `typeAware`. Add a
dedicated expectation after the existing `recommended` assertions:

```ts
it("exports an opt-in type-aware config without compiler diagnostics", () => {
  expect(typeAware.options).toEqual({ typeAware: true });
  expect(typeAware.options).not.toHaveProperty("typeCheck");
  expect(typeAware.jsPlugins as unknown).toEqual(expectedJsPlugins);
  expect(typeAware.rules).toEqual(recommendedRules);
});
```

Add `typeAware` to the exact `presets` expectation. Do not weaken or replace
the existing complete `recommended.rules` object assertion.

- [ ] **Step 2: Run the focused test to verify the contract fails**

Run:

```bash
bun test tests/config.test.ts
```

Expected: TypeScript/Bun test loading fails because `typeAware` is not yet
exported and the expected preset map does not yet contain it.

- [ ] **Step 3: Add the minimal export implementation**

After `export const recommended = presetFor(recommendedRules);` in
`src/index.ts`, add:

```ts
export const typeAware = {
  options: {
    typeAware: true,
  },
  jsPlugins,
  rules: recommended.rules,
} as const;
```

Add `typeAware` to the `presets` object. Do not add it to `ruleGroups`, because
it is a configuration mode rather than a rule group. Do not add any
`typescript/*` rule name to the package rules map.

- [ ] **Step 4: Run the focused config tests and typecheck**

Run:

```bash
bun test tests/config.test.ts
bun run typecheck
```

Expected: the config test passes, the existing recommended exact-map test
still passes, and TypeScript accepts the readonly tuple/config export.

- [ ] **Step 5: Commit the public API slice**

```bash
git add src/index.ts tests/config.test.ts
git commit -m "feat: add opt-in type-aware preset"
```

### Task 2: Create the isolated typed consumer and failure corpus

**Files:**
- Create: `examples/type-aware-consumer/package.json`
- Create: `examples/type-aware-consumer/oxlint.config.ts`
- Create: `examples/type-aware-consumer/tsconfig.json`
- Create: `examples/type-aware-consumer/src/effect-syntax-failures.ts`
- Create: `examples/type-aware-consumer/src/type-aware-failures.ts`
- Create: `examples/type-aware-consumer/src/valid-controls.ts`
- Create: `examples/type-aware-consumer/failure-modes/README.md`
- Create: `examples/type-aware-consumer/README.md`
- Create: `examples/type-aware-consumer/bun.lock`

**Interfaces:**
- Consumes: the packed package produced by the root build and the `typeAware` export from the package.
- Produces: a standalone consumer that owns `oxlint-tsgolint` and TypeScript 7, emits intentional diagnostics, and has a clean control file.

- [ ] **Step 1: Add the consumer package manifest and install its dependencies**

Create `examples/type-aware-consumer/package.json` with this dependency
boundary:

```json
{
  "name": "@opsydyn/oxlint-effect-type-aware-consumer-example",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "oxlint --config oxlint.config.ts src",
    "lint:valid": "oxlint --config oxlint.config.ts src/valid-controls.ts"
  },
  "dependencies": {
    "@opsydyn/oxlint-effect": "file:../..",
    "effect": "^3.21.4"
  },
  "devDependencies": {
    "oxlint": "^1.78.0",
    "oxlint-tsgolint": "^7.0.2001",
    "typescript": "^7.0.2"
  }
}
```

The local `file:../..` dependency is for direct development only. The pack
backed integration in Task 3 replaces it with the generated tarball before
installing the temporary consumer.

Build the local package before resolving its `dist` exports, from the
repository root:

```bash
bun run build
cd examples/type-aware-consumer
bun install
```

Expected: the fixture gets its own lockfile and installs `oxlint-tsgolint`
without adding it to the root package.

- [ ] **Step 2: Add the root config with the correct readonly tuple workaround**

Create `examples/type-aware-consumer/oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";
import { typeAware } from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  env: { builtin: true },
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  rules: {
    ...typeAware.rules,
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
  },
});
```

Do not spread `typeAware` as a whole into `defineConfig`; the explicit
`[...typeAware.jsPlugins]` spread is the required mutable-array boundary.
Do not add `typeCheck` to this configuration.

- [ ] **Step 3: Add a scoped TypeScript project**

Create `examples/type-aware-consumer/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "strict": true,
    "noEmit": true,
    "types": []
  },
  "include": ["oxlint.config.ts", "src/**/*.ts"]
}
```

Keep the include set narrow. Do not include `node_modules`, build outputs, or
the root repository source tree.

- [ ] **Step 4: Add an Effect syntax failure fixture**

Create `src/effect-syntax-failures.ts` with an unfixed, annotated anti-pattern
that is known to be covered by the existing recommended rules:

```ts
import { Effect } from "effect";

// EXPECT: linteffect/no-effect-as
// QA: Existing syntax-only Effect rule must still run when typeAware is enabled.
export const mapped = Effect.as(Effect.succeed(1), 2);
```

Keep the code intentionally invalid. The `EXPECT` ID must use the existing
`linteffect/<rule>` namespace so the root rule QA inventory remains aware of
the example.

- [ ] **Step 5: Add built-in type-aware failure fixtures**

Create `src/type-aware-failures.ts`:

```ts
async function loadValue(): Promise<number> {
  return 1;
}

// EXPECT: typescript/no-floating-promises
// QA: The stable Oxc type-aware engine must report the unhandled Promise.
loadValue();

const values = [1, 2, 3];

// EXPECT: typescript/no-misused-promises
// QA: The callback returns a Promise where the consumer expects void.
values.forEach(async (value) => {
  await loadValue();
  void value;
});
```

If the installed Oxc release emits a different documented location for the
second rule, keep the same rule ID and adjust only the example to the stable
supported trigger shape; do not remove the expected diagnostic.

- [ ] **Step 6: Add valid controls**

Create `src/valid-controls.ts` with no expected diagnostics. Keep the pipe/map
control as an expression statement rather than assigning it to an exported
constant: the existing recommended `no-effect-wrapper-alias` rule intentionally
reports exported Effect pipe aliases, and this control must run under the full
preset without a file-local override.

```ts
import { Effect } from "effect";

const loadValue = async (): Promise<number> => 1;

export const awaited = async () => await loadValue();
Effect.succeed(1).pipe(Effect.map((value) => value + 1));
```

The file must remain free of `EXPECT` annotations and must pass the fixture's
`lint:valid` command.

- [ ] **Step 7: Document all consumer config variants and setup failures**

In `examples/type-aware-consumer/README.md`, document runnable commands and
snippets for:

- local `file:../..` development;
- the packed npm artifact path used by Task 3;
- direct `typeAware` configuration with `options`, `jsPlugins`, and `rules`
  copied explicitly;
- adding a named group or rule-only export to `typeAware.rules`;
- CLI `--type-aware` without the package preset;
- explicit selection of built-in `typescript/*` rules;
- `typeAware` without `typeCheck`;
- a separate user-owned `typeCheck: true` configuration;
- editor/LSP use of the root option;
- the expected non-zero lint status for intentional failures;
- the expected zero status for `lint:valid` and `typecheck`.

In `failure-modes/README.md`, document examples for:

- missing `oxlint-tsgolint`;
- malformed or TypeScript-incompatible `tsconfig.json`;
- missing dependent `.d.ts` files in a monorepo;
- placing `options.typeAware` in a nested config instead of the root config;
- the difference between type-aware lint failures and compiler diagnostics;
- valid controls that should not report any expected IDs.

Use failure classes and remediation boundaries, not exact unstable error text.

- [ ] **Step 8: Run the fixture's direct checks**

Run:

```bash
cd examples/type-aware-consumer
bun run typecheck
bun run lint
bun run lint:valid
```

Expected: `typecheck` and `lint:valid` exit 0; `lint` exits non-zero because
the anti-pattern files are intentionally invalid and reports the expected
`linteffect/no-effect-as`, `typescript/no-floating-promises`, and
`typescript/no-misused-promises` IDs.

- [ ] **Step 9: Commit the consumer fixture**

```bash
git add examples/type-aware-consumer
git commit -m "test: add type-aware consumer fixture"
```

### Task 3: Add pack-backed expected-diagnostic verification

**Files:**
- Create: `scripts/verify-type-aware-consumer.ts`
- Modify: `package.json:20-37`

**Interfaces:**
- Consumes: the built package, `examples/type-aware-consumer`, and its `EXPECT` annotations.
- Produces: `bun run test:type-aware`, which exits 0 only when the packed consumer installs, typechecks, reports every expected diagnostic, reports no unexpected IDs, and passes the valid control file.

- [ ] **Step 1: Define the verification script contract**

Create `scripts/verify-type-aware-consumer.ts` with these functions:

```ts
type CommandResult = {
  status: number;
  output: string;
};

function run(command: string, args: string[], cwd: string): CommandResult;
function expectedRuleIds(root: string): Set<string>;
function observedRuleIds(output: string): Set<string>;
function assertExpectedDiagnostics(result: CommandResult, expected: Set<string>): void;
```

Use `node:child_process.spawnSync`, `node:fs/promises`, `node:path`, and
`node:os`. All subprocesses must use captured stdout/stderr and throw an
actionable error on unexpected setup failure.

- [ ] **Step 2: Build and pack the root package into a temporary directory**

The script must:

1. resolve the repository root from `import.meta.dir`;
2. create a temporary directory with `mkdtemp`;
3. run `npm pack --json --pack-destination packRoot` from the root after the
   root build has completed;
4. parse the JSON result and resolve the tarball as
   `join(packRoot, packResult[0].filename)`;
5. copy `examples/type-aware-consumer` into a second temporary consumer path;
6. remove the copied lockfile so the package dependency can be rewritten;
7. replace the copied package's `@opsydyn/oxlint-effect` dependency with
   ``file:${tarball}``;
8. install the copied consumer with `bun install`.

Use this exact pack-result boundary so the verification does not guess the
filename from the current package version:

```ts
const packResult = run(
  "npm",
  ["pack", "--json", "--pack-destination", packRoot],
  repoRoot,
);
if (packResult.status !== 0) {
  throw new Error(`npm pack failed:\n${packResult.output}`);
}
const [{ filename }] = JSON.parse(packResult.output) as Array<{
  filename: string;
}>;
const tarball = join(packRoot, filename);
```

The original example directory and its lockfile must not be modified by the
pack-backed run. Always remove temporary directories in a `finally` block.

- [ ] **Step 3: Verify install and typecheck**

Run in the copied consumer:

```bash
bun install
bun run typecheck
```

Require exit code 0 for both commands. A missing package, broken declaration,
or incompatible TypeScript project is a typed QA failure, not a skipped test.

- [ ] **Step 4: Compare expected and observed diagnostics**

Read every `.ts` file under the copied consumer's `src` directory and extract
unique IDs from:

```text
// EXPECT: linteffect/no-effect-as
// EXPECT: typescript/no-floating-promises
```

Run:

```bash
bun run lint
```

Require exit code 1 because the source intentionally contains anti-patterns.
Extract observed IDs from tokens consisting of `linteffect(` or
`typescript(`, a lower-case hyphenated rule ID, and `)`. Prefix the extracted
IDs with their namespaces and compare sets. Throw with sorted `missing` and
`unexpected` lists when either set is non-empty.

- [ ] **Step 5: Verify valid controls separately**

Run:

```bash
bun run lint:valid
```

Require exit code 0 and assert the output contains neither `linteffect(` nor
`typescript(`. This proves the failure corpus is not merely causing a global
false positive.

- [ ] **Step 6: Add the package script and run the isolated gate**

Add this root script:

```json
"test:type-aware": "bun run build && bun scripts/verify-type-aware-consumer.ts"
```

Run:

```bash
bun run test:type-aware
```

Expected: exit code 0 from the verification script, even though the nested
intentional `bun run lint` command exits 1.

- [ ] **Step 7: Commit the pack-backed gate**

```bash
git add package.json scripts/verify-type-aware-consumer.ts
git commit -m "test: verify type-aware package consumption"
```

### Task 4: Document the public variants and update the roadmap

**Files:**
- Modify: `README.md:1-120`
- Modify: `examples/README.md:1-110`
- Modify: `examples/type-aware-consumer/README.md`
- Modify: `examples/type-aware-consumer/failure-modes/README.md`
- Create: `roadmap/13-type-aware-effect-semantics/README.md`

**Interfaces:**
- Consumes: the exported `typeAware` shape from Task 1 and the fixture commands from Tasks 2-3.
- Produces: public documentation that distinguishes syntax-only rules, Oxc built-in typed rules, and future custom semantic Effect rules.

- [ ] **Step 1: Add the package README configuration section**

After the existing `recommended` configuration section, add this exact usage
pattern:

```ts
import { defineConfig } from "oxlint";
import { typeAware } from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  rules: typeAware.rules,
});
```

Document that `typeAware` does not select `typescript/*` rules and does not
enable `typeCheck`. Show the consumer-owned install command:

```bash
bun add -d oxlint oxlint-tsgolint @opsydyn/oxlint-effect
```

Document the current TypeScript 7 requirement, root-only `options.typeAware`,
monorepo declaration/build requirement, and the unsupported custom typed-rule
boundary with links to the official Oxc docs.

- [ ] **Step 2: Document composition variants**

Add examples showing:

```ts
import {
  typeAware,
  domainModelingRules,
  errorModelingRules,
} from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  rules: {
    ...typeAware.rules,
    ...domainModelingRules,
    ...errorModelingRules,
  },
});
```

Also document the named preset form for each existing group using the same
`jsPlugins: [...preset.jsPlugins]` workaround, and clarify that `typeAware` is
the only new mode in this slice.

- [ ] **Step 3: Document CLI and compiler-diagnostic variants**

Document these separately:

```bash
oxlint --type-aware
```

```ts
export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
```

State that the package's `typeAware` preset uses the first option only. The
second snippet is an explicit consumer configuration and is not part of the
package preset.

- [ ] **Step 4: Index all failure and control examples**

Update `examples/README.md` with a Type-Aware Consumer section linking to:

- the local development command;
- the pack-backed command `bun run test:type-aware`;
- the intentional lint failure corpus;
- the valid controls;
- the setup failure-mode document.

Keep the existing `lint:examples` non-zero semantics and `comm` feedback loop
unchanged. The new type-aware failure corpus must not be described as a clean
application.

- [ ] **Step 5: Add the roadmap group**

Create `roadmap/13-type-aware-effect-semantics/README.md` with:

- the Oxc and EffectPatterns context;
- an `[x]` checklist for the opt-in config export, consumer fixture, pack-backed
  verification, documentation, and CI gate after those tasks land;
- an `[ ]` API gate requiring supported custom typed-plugin access;
- Slice A public Effect contracts;
- Slice B service and environment contracts;
- Slice C resource ownership research;
- explicit non-goals for duplicate TypeScript programs, automatic `typeCheck`,
  and promoting resource-name heuristics to type proofs.

Do not add these roadmap items to `docs/rule-qa-inventory.json`, because the
initial slice exports no new lint rule.

- [ ] **Step 6: Run documentation and QA checks**

Run:

```bash
bun test tests/rule-qa.test.ts
bun run test:type-aware
```

Expected: existing rule documentation remains complete, the new
`linteffect/no-effect-as` example does not create an inventory gap, and the
pack-backed typed consumer gate passes.

- [ ] **Step 7: Commit docs and roadmap**

```bash
git add README.md examples/README.md examples/type-aware-consumer roadmap/13-type-aware-effect-semantics/README.md
git commit -m "docs: document type-aware configuration variants"
```

### Task 5: Add the dedicated CI gate and release metadata

**Files:**
- Modify: `.github/workflows/ci.yml:1-50`
- Create: `.changeset/type-aware-preset.md`

**Interfaces:**
- Consumes: `bun run test:type-aware` from Task 3 and the documentation contract from Task 4.
- Produces: a required CI signal for the opt-in consumer and an additive minor Changeset.

- [ ] **Step 1: Add the separate CI job**

Append a job to `.github/workflows/ci.yml` without changing the existing
`build` job:

```yaml
  type-aware:
    name: Type-aware consumer QA
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Install root dependencies
        run: bun install --frozen-lockfile

      - name: Verify packed type-aware consumer
        run: bun run test:type-aware
```

The job must fail if the consumer cannot install tsgolint, resolve the package
declarations, or produce the expected rule IDs. It must not enable
`typeCheck`.

- [ ] **Step 2: Add the Changeset**

Create `.changeset/type-aware-preset.md`:

```md
---
"@opsydyn/oxlint-effect": minor
---

Add an opt-in `typeAware` configuration preset for Oxlint's TypeScript-aware
linting engine. The preset preserves the existing recommended Effect rules,
does not enable compiler diagnostics, and leaves `oxlint-tsgolint` installation
to consumers.
```

- [ ] **Step 3: Run the workflow-equivalent local checks**

Run:

```bash
bun install --frozen-lockfile
bun run test:type-aware
```

Expected: both commands exit 0. Do not run `typeCheck` as part of this gate.

- [ ] **Step 4: Commit CI and release metadata**

```bash
git add .github/workflows/ci.yml .changeset/type-aware-preset.md
git commit -m "ci: gate opt-in type-aware consumer"
```

### Task 6: Run the complete release-quality verification

**Files:**
- Verify: all files changed by Tasks 1-5

**Interfaces:**
- Consumes: the complete implementation and all documented failure/control fixtures.
- Produces: fresh local evidence for package quality, typed consumer behaviour, and release readiness.

- [ ] **Step 1: Reconcile the final diff and generated files**

Run:

```bash
git status --short
git diff --check
git diff --stat
```

Expected: only the planned files are changed, generated `examples/type-aware-consumer/bun.lock` is present if the fixture uses it, and there are no whitespace errors.

- [ ] **Step 2: Run the focused test suites**

Run:

```bash
bun test tests/config.test.ts
bun test tests/rule-qa.test.ts
bun run test:type-aware
```

Expected: all commands exit 0; the nested intentional `lint` run is handled
inside the typed QA script and does not leak a false failure.

- [ ] **Step 3: Run the standard package gates**

Run:

```bash
bun run test
bun run typecheck
bun run build
bun run lint
bun run docs:api:check
bun run size
npm_config_cache=/tmp/effect-oxlint-type-aware-npm-cache npm run pack:dry-run
```

Expected: every command exits 0. `size` must remain within the existing
27 KB Brotli budget; do not change the budget for an unmeasured reason.

- [ ] **Step 4: Run the intentional example feedback loop**

Run:

```bash
bun run lint:examples > /tmp/linteffect-examples-observed.log 2>&1 || true
rg -o "EXPECT: linteffect/[a-zA-Z0-9-]+" examples \
  | sed "s/.*EXPECT: //" \
  | sort -u > /tmp/linteffect-examples-expected.txt
rg -o "linteffect\\([^)]+\\)" /tmp/linteffect-examples-observed.log \
  | sed "s/linteffect(/linteffect\\//; s/)//" \
  | sort -u > /tmp/linteffect-examples-observed.txt
comm -23 /tmp/linteffect-examples-expected.txt /tmp/linteffect-examples-observed.txt
```

Expected: the final `comm` command prints no lines. The initial lint command
may exit non-zero because the corpus is intentionally invalid.

- [ ] **Step 5: Inspect the packed file list**

Run:

```bash
npm_config_cache=/tmp/effect-oxlint-type-aware-npm-cache npm pack --dry-run
```

Confirm the package contains `dist` and `README.md` but does not contain the
consumer fixture, `oxlint-tsgolint`, or repository-only QA files.

- [ ] **Step 6: Perform the final review and report evidence**

Before claiming completion, report:

- the `typeAware` export and exact readonly-plugin usage;
- the fact that `recommended` is unchanged;
- the typed consumer's expected and observed namespaces;
- the separate CI job;
- the Changeset and intended minor release;
- any environment limitation separately from product failures.

Do not claim custom semantic Effect rules are type-aware; the upstream API gate
remains open and is recorded in Roadmap 13.

## Plan Self-Review Checklist

- [ ] Task 1 covers the public export, exact config shape, readonly tuple, and unchanged recommended preset.
- [ ] Task 2 covers the consumer-owned engine, TypeScript 7 fixture, unfixed lint failures, valid controls, and setup failure documentation.
- [ ] Task 3 proves the packed npm boundary without adding tsgolint to the root dependency graph.
- [ ] Task 4 documents every requested configuration variant and the failure corpus, and adds Roadmap 13.
- [ ] Task 5 adds a separate CI gate and minor Changeset.
- [ ] Task 6 covers focused QA, standard release gates, intentional non-zero examples, and package contents.
- [ ] No task enables `typeCheck` through the package preset.
- [ ] No task creates duplicate TypeScript program analysis.
- [ ] No future semantic rule is treated as implemented before the official Oxc typed-plugin API gate is satisfied.
