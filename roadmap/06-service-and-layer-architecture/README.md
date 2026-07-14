# 06 Service And Layer Architecture

Service and layer rules teach modern Effect architecture: `Effect.Service`,
explicit dependencies, accessor generation, composable layers, and visible
dependency graph construction.

Primary references:

- `EffectPatterns-main/docs/SERVICE_PATTERNS.md`
- `EffectPatterns-main/packages/analysis-core/ALL_ANTI_PATTERNS_REFERENCE.md`
- `styleguide.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [x] | `linteffect/prefer-effect-service` | `context-tag-anti-pattern` | strict | low | `Context.Tag` / `Context.GenericTag` in app services |
| [x] | `linteffect/no-layer-provide-in-service-definition` | `layer-provide-anti-pattern` | recommended | low | `Layer.provide` inside `Effect.Service` class definition |
| [x] | `linteffect/require-service-accessors` | service pattern | strict | low | `Effect.Service` options without `accessors: true` |
| [x] | `linteffect/require-service-dependencies` | service pattern | strict | medium | service uses `yield* SomeService` but lacks `dependencies` option |
| [x] | `linteffect/no-namespace-effect-import` | import pattern | strict | low | `import * as Effect from "effect"` or platform namespace imports |
| [x] | `linteffect/no-manual-service-object-export` | service pattern | ddd | medium | exported service-shaped object instead of `Effect.Service` |
| [x] | `linteffect/no-layer-merge-in-request-handler` | layer composition | runtime | medium | `Layer.merge*` / `Layer.provide` inside route handlers |
| [x] | `linteffect/no-service-method-returning-promise` | service pattern | recommended | medium | service object method returns `Promise` instead of `Effect` |
| [x] | `linteffect/prefer-layer-pipe` | styleguide layer pillar | strict | low | nested `Layer.provide(Layer.provide(...))` or static Layer call towers that can be expressed as `Layer.pipe()` |
| [x] | `linteffect/no-inline-layer-provide-in-program` | styleguide layer pillar | runtime | medium | `Layer.provide` / `Effect.provide` buried inside workflows instead of app/service composition boundaries |
| [x] | `linteffect/prefer-layer-mergeall-for-infrastructure` | styleguide layer grouping | strict | medium | long `Layer.merge` chains where `Layer.mergeAll(...)` would group dependencies by concern |
| [x] | `linteffect/no-service-layer-scatter` | styleguide layer grouping | strict | high | many individual `provide` calls in one module instead of grouped Infrastructure/Application/Domain layer constants |

## Slice Plan

### Slice 1: Modern Service Shape

- [x] `prefer-effect-service`
- [x] `no-layer-provide-in-service-definition`
- [x] `require-service-accessors`

### Slice 2: Dependency Architecture

- [x] `require-service-dependencies`
- [x] `no-layer-merge-in-request-handler`
- [x] `no-service-method-returning-promise`

### Slice 3: Import And Export Hygiene

- [x] `no-namespace-effect-import`
- [x] `no-manual-service-object-export`

### Slice 4: Layer Pillar Style

- [x] `prefer-layer-pipe`
- [x] `no-inline-layer-provide-in-program`
- [x] `prefer-layer-mergeall-for-infrastructure`

### Slice 5: Layer Grouping

- [x] `no-service-layer-scatter`

## Detection Notes

`Effect.Service` calls have a distinctive nested call shape:

- `class Foo extends Effect.Service<Foo>()("Foo", { ... }) {}`
- the second call argument is the options object
- `effect`, `scoped`, `dependencies`, and `accessors` can be inspected AST-only

Start with exported classes and exported service constants. Avoid flagging
library adapters or tests until path options exist.

Layer style-guide rules detect shape first, not broad architecture. The
`no-service-layer-scatter` rule stays conservative by reporting only after three
separate layer/live constants use inline provisioning in one module.

Slice 2 gap review:

- Covered now: missing `dependencies` for `yield* SomeService`, namespace Effect
  imports, manual exported service objects, layer composition in named
  request/route/handler functions, and Promise-returning service methods.
- Service and Layer Architecture roadmap complete.
