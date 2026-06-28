# linteffect Oxlint plugin

Oxlint plugin rules for Effect TypeScript code-shape constraints.

## Install

```bash
bun add -d oxlint @opsydyn/oxlint-effect
```

## Configure

```ts
import { defineConfig } from "oxlint";
import { recommended } from "@opsydyn/oxlint-effect";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: recommended.jsPlugins,
  rules: recommended.rules,
});
```

For local development inside this repository, point `jsPlugins` at the TypeScript source:

```ts
import { defineConfig } from "oxlint";
import { allRules } from "./src/index";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [{ name: "linteffect", specifier: "./src/index.ts" }],
  rules: allRules,
});
```

## Initial Rules

- `linteffect/no-react-state`
- `linteffect/no-if-statement`
- `linteffect/no-switch-statement`
- `linteffect/no-effect-as`
- `linteffect/no-effect-do`
- `linteffect/no-effect-bind`
- `linteffect/no-runtime-runfork`
- `linteffect/no-effect-async`
- `linteffect/prevent-dynamic-imports`
- `linteffect/no-nested-effect-call`
- `linteffect/no-effect-ladder`
- `linteffect/no-flatmap-ladder`
- `linteffect/no-pipe-ladder`
- `linteffect/no-call-tower`
- `linteffect/no-effect-orElse-ladder`
- `linteffect/no-ternary`
- `linteffect/no-return-null`
- `linteffect/no-option-as`
- `linteffect/no-effect-never`
- `linteffect/no-arrow-ladder`
- `linteffect/no-branch-in-object`
- `linteffect/no-iife-wrapper`
- `linteffect/no-return-in-arrow`
- `linteffect/no-return-in-callback`
- `linteffect/no-effect-fn-generator`
- `linteffect/no-effect-sync-console`
- `linteffect/no-nested-effect-gen`
- `linteffect/no-match-void-branch`
- `linteffect/no-match-effect-branch`
- `linteffect/warn-effect-sync-wrapper`
- `linteffect/no-effect-side-effect-wrapper`
- `linteffect/no-effect-all-step-sequencing`
- `linteffect/no-try-catch`
- `linteffect/no-effect-wrapper-alias`
- `linteffect/no-manual-effect-channels`
- `linteffect/no-wrapgraphql-catchall`
- `linteffect/no-render-side-effects`
- `linteffect/no-atom-registry-effect-sync`
- `linteffect/no-family-collection-read`
- `linteffect/no-inline-runtime-provide`
- `linteffect/no-naked-object-state-update`
- `linteffect/no-effect-succeed-variable`
- `linteffect/no-effect-type-alias`
- `linteffect/no-model-overlay-cast`
- `linteffect/no-unknown-boolean-coercion-helper`
- `linteffect/no-fromnullable-nullish-coalesce`
- `linteffect/no-option-boolean-normalization`
- `linteffect/no-string-sentinel-return`
- `linteffect/no-string-sentinel-const`
