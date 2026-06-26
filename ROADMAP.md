# Oxlint Parity Roadmap

Last updated: 2026-06-26

## Current Snapshot

Source of truth:
- Upstream rules: `biome-effect-linting-rules-master/rules/*.grit`
- Upstream presets: `biome-effect-linting-rules-master/configs/*.jsonc`
- Oxlint implementation: `src/index.ts`
- Public rule docs: `README.md`

Parity status:
- Rule-folder parity: 45 / 49 rules ported, 4 remaining
- Upstream `core` preset parity: 34 / 34 rules ported, 0 remaining
- Upstream `full` preset parity: 43 / 47 rules ported, 4 remaining
- Upstream `web` preset parity: 6 / 6 rules ported, 0 remaining
- Upstream `ts-type` preset parity: 3 / 7 rules ported, 4 remaining

Upstream preset note:
- `full.jsonc` lists 47 rules, while `rules/*.grit` contains 49 rules.
- `full.jsonc` currently omits `no-effect-succeed-variable` and `no-inline-runtime-provide`.
- `web.jsonc` includes `no-inline-runtime-provide`, so keep tracking it for rule-folder/web parity.

## Update Protocol

Only mark a rule complete after all of these pass:

```bash
bun run test
bun run typecheck
bun run build
npm pack --dry-run
```

For each completed rule:
- [ ] Add direct unit coverage in `tests/plugin.test.ts`
- [ ] Add config coverage in `tests/config.test.ts`
- [ ] Add Oxlint CLI fixture coverage in `tests/oxlint.integration.test.ts`
- [ ] Add the rule to `tests/fixtures/oxlint/oxlint.config.ts`
- [ ] Add invalid fixture code in `tests/fixtures/oxlint/invalid.ts`
- [ ] Export the rule from `src/index.ts`
- [ ] Add the rule to `README.md`
- [ ] Update this roadmap's counts and checkbox state

## Next Slice

- [ ] `no-fromnullable-nullish-coalesce`
- [ ] `no-option-boolean-normalization`
- [ ] `no-string-sentinel-return`
- [ ] `no-string-sentinel-const`

Why next:
- Upstream `core` parity is complete.
- Upstream `web` parity is complete.
- These are the final four upstream `ts-type` preset rules and share nullish/boolean/string sentinel normalization context.

Expected upstream behavior:
- Flag fromNullable nullish coalescing, Option boolean normalization, and string sentinel returns/consts according to upstream Grit rules.
- Preserve existing valid Effect pipeline, generator, Match, and wrapper fixture behavior.

## Ported Rules

- [x] `no-react-state`
- [x] `no-if-statement`
- [x] `no-switch-statement`
- [x] `no-effect-as`
- [x] `no-effect-do`
- [x] `no-effect-bind`
- [x] `no-runtime-runfork`
- [x] `no-effect-async`
- [x] `prevent-dynamic-imports`
- [x] `no-nested-effect-call`
- [x] `no-effect-ladder`
- [x] `no-flatmap-ladder`
- [x] `no-pipe-ladder`
- [x] `no-call-tower`
- [x] `no-effect-orElse-ladder`
- [x] `no-ternary`
- [x] `no-return-null`
- [x] `no-option-as`
- [x] `no-effect-never`
- [x] `no-arrow-ladder`
- [x] `no-branch-in-object`
- [x] `no-iife-wrapper`
- [x] `no-return-in-arrow`
- [x] `no-return-in-callback`
- [x] `no-effect-fn-generator`
- [x] `no-effect-sync-console`
- [x] `no-nested-effect-gen`
- [x] `no-match-void-branch`
- [x] `no-match-effect-branch`
- [x] `warn-effect-sync-wrapper`
- [x] `no-effect-side-effect-wrapper`
- [x] `no-effect-all-step-sequencing`
- [x] `no-try-catch`
- [x] `no-effect-wrapper-alias`
- [x] `no-manual-effect-channels`
- [x] `no-wrapgraphql-catchall`
- [x] `no-render-side-effects`
- [x] `no-atom-registry-effect-sync`
- [x] `no-family-collection-read`
- [x] `no-inline-runtime-provide`
- [x] `no-naked-object-state-update`
- [x] `no-effect-succeed-variable`
- [x] `no-effect-type-alias`
- [x] `no-model-overlay-cast`
- [x] `no-unknown-boolean-coercion-helper`

## Core Preset Remaining

Complete.

## Web Preset Remaining

Complete.

## TS-Type Preset Remaining

- [x] `no-effect-type-alias`
- [x] `no-model-overlay-cast`
- [x] `no-unknown-boolean-coercion-helper`
- [ ] `no-fromnullable-nullish-coalesce`
- [ ] `no-option-boolean-normalization`
- [ ] `no-string-sentinel-return`
- [ ] `no-string-sentinel-const`

## Full-Only Remaining

Complete.

## Rule-Folder Parity Remaining Outside Current Presets

Complete.

## Suggested Slice Order

1. Core expression/sentinel rules:
   - [x] `no-effect-never`

2. Core wrapper/ladder rules:
   - [x] `no-effect-wrapper-alias`
   - [x] `no-arrow-ladder`
   - [x] `no-branch-in-object`
   - [x] `no-iife-wrapper`
   - [x] `no-return-in-arrow`
   - [x] `no-return-in-callback`

3. Core Effect sequencing rules:
   - [x] `no-effect-fn-generator`
   - [x] `no-effect-sync-console`
   - [x] `no-nested-effect-gen`
   - [x] `no-match-void-branch`
   - [x] `no-match-effect-branch`
   - [x] `warn-effect-sync-wrapper`
   - [x] `no-effect-side-effect-wrapper`
   - [x] `no-effect-all-step-sequencing`
   - [x] `no-try-catch`
   - [x] `no-manual-effect-channels`

4. Web and React runtime rules:
   - [x] `no-render-side-effects`
   - [x] `no-atom-registry-effect-sync`
   - [x] `no-family-collection-read`
   - [x] `no-inline-runtime-provide`
   - [x] `no-naked-object-state-update`

5. TS-type and sentinel normalization rules:
   - [x] `no-effect-type-alias`
   - [x] `no-model-overlay-cast`
   - [x] `no-unknown-boolean-coercion-helper`
   - [ ] `no-fromnullable-nullish-coalesce`
   - [ ] `no-option-boolean-normalization`
   - [ ] `no-string-sentinel-return`
   - [ ] `no-string-sentinel-const`

6. Remaining parity rules:
   - [x] `no-wrapgraphql-catchall`
   - [x] `no-effect-succeed-variable`
