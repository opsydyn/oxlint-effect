# Platform And Boundary Hygiene Slice 2 Design

## Goal

Add three strict, path-aware rules that keep shared Effect modules portable,
centralise environment configuration, and make Effect execution boundaries
explicit:

- `linteffect/no-node-platform-in-shared-code`
- `linteffect/no-process-env-direct-read`
- `linteffect/no-hidden-effect-execution`

## Path Policy

The rules use `context.filename` and a small in-plugin glob matcher. The
matcher supports `*` within a path segment and `**` across path segments. It
normalises path separators before comparing an absolute linted filename with a
configured pattern.

Every path-aware rule accepts one optional rule-options object:

```ts
[{ boundaryPaths?: string[] }]
```

`no-process-env-direct-read` also accepts `configPaths`:

```ts
[{ boundaryPaths?: string[]; configPaths?: string[] }]
```

Default `boundaryPaths` are:

```ts
[
  "bin/**",
  "scripts/**",
  "cli/**",
  "**/main.ts",
  "app/api/**/route.ts",
  "server/**",
  "*.test.ts",
  "*.spec.ts",
]
```

Default `configPaths` are:

```ts
["**/config/**", "**/*Config.ts", "**/*ConfigLayer.ts"]
```

User-supplied arrays replace the corresponding defaults. This keeps a
project's allowed boundaries explicit and avoids hidden unions of local and
package defaults.

## Rule Contracts

### no-node-platform-in-shared-code

Report an `ImportDeclaration` outside a configured boundary when it imports a
Node built-in module. This includes `node:*` specifiers and a conservative,
explicit set of bare Node built-in specifiers. Do not match third-party package
names merely because they start with `node`.

The rule is filename-gated, not Effect-import-gated: portability is relevant to
all reusable TypeScript modules. It does not analyse `require`, dynamic import,
types, or module resolution.

### no-process-env-direct-read

Report `process.env` reads outside a configured boundary or config path.
`process.env.NAME`, optional chaining forms, and computed reads are covered.
Assignments to `process.env` are ignored; mutation policy is out of scope.

The rule is filename-gated, not Effect-import-gated. It does not trace aliases,
destructure data flow, validate environment keys, or inspect configuration
values.

### no-hidden-effect-execution

Report direct `Effect.run*` calls outside configured boundary paths. Covered
members are the existing `isEffectRunCall()` surface, so this rule does not
silently diverge from the package's generic run-boundary detection.

The rule requires an Effect ecosystem import and only checks direct member-call
syntax. It does not infer aliases, inspect function names, or change
`no-run-effect-outside-boundary` behaviour.

## Public API And Defaults

Register the three rules in the plugin and add them to
`platformAndBoundaryHygieneRules` and `platformAndBoundaryHygiene`. Document
them as strict, path-sensitive guidance. Preserve the package's existing
`recommended = allRules` contract, so registering the rules also includes them
in `recommended` and its exact config expectation.

## Verification And Documentation

Every rule must include:

- direct unit coverage for violations, default exemptions, and custom paths;
- explicit Oxlint fixture config entries and CLI coverage;
- invalid and valid fixture examples;
- an annotated backend anti-pattern example using the repository's `EXPECT`
  and `QA` format;
- README and roadmap documentation;
- group/preset and exact recommended-config expectation coverage.

The slice introduces no changeset. Before completion, run `bun run test`,
`bun run typecheck`, `bun run docs:api:check`, `bun run build`, `bun run lint`,
`bun run size`, `bun run pack:dry-run`, and `git diff --check`.
