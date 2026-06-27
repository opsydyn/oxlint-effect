# Lint QA Examples Design

## Goal

Create a lint-only `examples/` corpus that showcases one intentional anti-pattern for every `linteffect` Oxlint rule, split across frontend, backend, and shared type/model examples. The examples are not a runnable app; they are a QA surface for observing warnings and finding rule defects when expected warnings do not appear.

## Scope

In scope:
- Add a root `examples/` folder with annotated TypeScript and TSX files.
- Add an examples-specific Oxlint config that loads the local plugin from `../src/index.ts`.
- Add a package script that runs Oxlint over the examples.
- Annotate every intentionally problematic snippet with the expected rule ID and a short QA note.
- Keep the examples intentionally lint-dirty.

Out of scope:
- Building or running a frontend or backend server.
- Fixing the anti-patterns in the example files.
- Adding an automated snapshot verifier in this slice.
- Changing rule behavior unless the example run exposes a real plugin defect.

## Architecture

The examples folder is a documentation-quality QA corpus. Each file groups rules by context rather than by implementation internals:

- `examples/oxlint.config.ts` enables the local plugin and all current rules.
- `examples/frontend/react-anti-patterns.tsx` contains React/render/atom anti-patterns.
- `examples/backend/effect-anti-patterns.ts` contains service, runtime, control-flow, and Effect pipeline anti-patterns.
- `examples/shared/type-boundary-anti-patterns.ts` contains type, schema/model, Option, and sentinel anti-patterns.
- `examples/README.md` explains that the code is intentionally bad and describes the feedback loop.

The examples use local declarations for external symbols such as React hooks, Effect helpers, atom APIs, and GraphQL wrappers. This keeps the corpus lintable without installing or running app dependencies.

## Annotation Contract

Every anti-pattern snippet must carry an annotation immediately above the code that should warn:

```ts
// EXPECT: linteffect/no-effect-sync-console
// QA: Effect.sync should not hide console side effects.
const audit = Effect.sync(() => console.log("created"));
```

The `EXPECT` line is the manual QA contract. Running `bun run lint:examples` should emit the named rule for the nearby code. If a warning is absent, the next step is to decide whether the snippet missed the rule's actual trigger shape or the rule has a defect.

## Rule Coverage

The corpus must include all currently exported rules from `README.md` and `src/index.ts`:

- React and render rules: `no-react-state`, `no-render-side-effects`, `no-atom-registry-effect-sync`, `no-family-collection-read`.
- Imperative branching rules: `no-if-statement`, `no-switch-statement`, `no-ternary`, `no-try-catch`.
- Effect combinator and wrapper rules: `no-effect-as`, `no-effect-do`, `no-effect-bind`, `no-runtime-runfork`, `no-effect-async`, `prevent-dynamic-imports`, `no-nested-effect-call`, `no-effect-ladder`, `no-flatmap-ladder`, `no-pipe-ladder`, `no-call-tower`, `no-effect-orElse-ladder`, `no-effect-fn-generator`, `no-effect-sync-console`, `warn-effect-sync-wrapper`, `no-effect-side-effect-wrapper`, `no-effect-all-step-sequencing`, `no-effect-wrapper-alias`, `no-manual-effect-channels`, `no-inline-runtime-provide`, `no-effect-succeed-variable`.
- Callback and local-flow rules: `no-arrow-ladder`, `no-branch-in-object`, `no-iife-wrapper`, `no-return-in-arrow`, `no-return-in-callback`, `no-return-null`.
- Match and Option rules: `no-option-as`, `no-nested-effect-gen`, `no-match-void-branch`, `no-match-effect-branch`, `no-fromnullable-nullish-coalesce`, `no-option-boolean-normalization`.
- Boundary and sentinel rules: `no-wrapgraphql-catchall`, `no-naked-object-state-update`, `no-effect-type-alias`, `no-model-overlay-cast`, `no-unknown-boolean-coercion-helper`, `no-string-sentinel-return`, `no-string-sentinel-const`, `no-effect-never`.

## Data Flow

The QA flow is intentionally simple:

1. A developer reads an annotated snippet.
2. The developer runs `bun run lint:examples`.
3. Oxlint loads `examples/oxlint.config.ts`.
4. The config loads the local `linteffect` plugin implementation from `../src/index.ts`.
5. Oxlint reports warnings against the intentionally invalid example files.
6. The developer compares observed rule IDs with nearby `EXPECT` annotations.

## Error Handling

The example command should fail when warnings are emitted if Oxlint treats warnings as a non-zero exit in this configuration. That is acceptable because the corpus is intentionally invalid. The README must describe the expected behavior so a non-zero lint run is not mistaken for a broken example.

If Oxlint cannot load the local plugin config, that is a setup defect in the examples. If Oxlint loads correctly but a specific `EXPECT` annotation does not produce its rule warning, that is QA feedback for either the snippet shape or the rule implementation.

## Testing and Verification

Implementation should verify:

- `bun run lint:examples` runs against `examples/` and emits `linteffect/*` diagnostics.
- Each exported rule ID appears at least once in either the examples source annotations or observed output.
- The existing plugin verification remains green: `bun run test`, `bun run typecheck`, and `bun run build`.
- The examples are not included in the package tarball unless intentionally added later.

## Open Decisions

No open decisions remain for this slice. The examples are lint-only, annotated, and intentionally warning-producing.
