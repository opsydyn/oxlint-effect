# 06 Service And Layer Architecture

Service and layer rules teach modern Effect architecture: `Effect.Service`,
explicit dependencies, accessor generation, and composable layers.

Primary references:

- `EffectPatterns-main/docs/SERVICE_PATTERNS.md`
- `EffectPatterns-main/packages/analysis-core/ALL_ANTI_PATTERNS_REFERENCE.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [ ] | `linteffect/prefer-effect-service` | `context-tag-anti-pattern` | strict | low | `Context.Tag` / `Context.GenericTag` in app services |
| [ ] | `linteffect/no-layer-provide-in-service-definition` | `layer-provide-anti-pattern` | recommended | low | `Layer.provide` inside `Effect.Service` class definition |
| [ ] | `linteffect/require-service-accessors` | service pattern | strict | low | `Effect.Service` options without `accessors: true` |
| [ ] | `linteffect/require-service-dependencies` | service pattern | strict | medium | service uses `yield* SomeService` but lacks `dependencies` option |
| [ ] | `linteffect/no-namespace-effect-import` | import pattern | strict | low | `import * as Effect from "effect"` or platform namespace imports |
| [ ] | `linteffect/no-manual-service-object-export` | service pattern | ddd | medium | exported service-shaped object instead of `Effect.Service` |
| [ ] | `linteffect/no-layer-merge-in-request-handler` | layer composition | runtime | medium | `Layer.merge*` / `Layer.provide` inside route handlers |
| [ ] | `linteffect/no-service-method-returning-promise` | service pattern | recommended | medium | service object method returns `Promise` instead of `Effect` |

## Slice Plan

### Slice 1: Modern Service Shape

- [ ] `prefer-effect-service`
- [ ] `no-layer-provide-in-service-definition`
- [ ] `require-service-accessors`

### Slice 2: Dependency Architecture

- [ ] `require-service-dependencies`
- [ ] `no-layer-merge-in-request-handler`
- [ ] `no-service-method-returning-promise`

### Slice 3: Import And Export Hygiene

- [ ] `no-namespace-effect-import`
- [ ] `no-manual-service-object-export`

## Detection Notes

`Effect.Service` calls have a distinctive nested call shape:

- `class Foo extends Effect.Service<Foo>()("Foo", { ... }) {}`
- the second call argument is the options object
- `effect`, `scoped`, `dependencies`, and `accessors` can be inspected AST-only

Start with exported classes and exported service constants. Avoid flagging
library adapters or tests until path options exist.

