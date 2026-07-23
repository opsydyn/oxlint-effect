# 07 Platform And Boundary Hygiene

Platform and boundary rules keep reusable code portable, parse-dont-validate,
and explicit about the edge where effects are executed.

Primary references:

- `EffectPatterns-main/packages/analysis-core/ALL_ANTI_PATTERNS_REFERENCE.md`
- `EffectPatterns-main/content/published/patterns/testing/accessing-current-time-with-clock.mdx`
- `EffectPatterns-main/docs/SERVICE_PATTERNS.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [x] | `linteffect/no-node-fs-in-effect-code` | `node-fs` | recommended | low | `fs`, `node:fs`, `fs/promises`, and `node:fs/promises` imports and module-scope `require()` calls in Effect code |
| [x] | `linteffect/no-node-platform-in-shared-code` | `node-platform-in-shared-code` | strict | medium | Node built-in imports outside configured boundary paths |
| [x] | `linteffect/no-json-parse-without-schema` | `schema-decode-unknown` | recommended | medium | `JSON.parse` without nearby `Schema.decodeUnknown` or Schema import |
| [x] | `linteffect/no-date-now-in-effect` | Clock guidance | recommended | low | `Date.now()` inside `Effect.sync`, `Effect.gen`, or service methods |
| [ ] | `linteffect/no-new-date-in-domain-logic` | time modeling | ddd | medium | `new Date()` inside domain/service logic instead of Clock/DateTime |
| [x] | `linteffect/no-process-env-direct-read` | config handling | strict | medium | direct and computed `process.env` reads outside configured boundary and config paths |
| [ ] | `linteffect/no-boundary-try-catch-without-effect-map` | boundary guidance | strict | medium | boundary `try/catch` that does not run or map an Effect program |
| [x] | `linteffect/no-hidden-effect-execution` | hidden-effect-execution | strict | medium | direct `Effect.run*` calls in Effect modules outside configured boundary paths |

## Slice Plan

### Slice 1: Platform Substitution

- [x] `no-node-fs-in-effect-code`
- [x] `no-json-parse-without-schema`
- [x] `no-date-now-in-effect`

### Slice 2: Boundary Clarity

- [x] `no-node-platform-in-shared-code`
- [x] `no-process-env-direct-read`
- [x] `no-hidden-effect-execution`

### Slice 3: Time And Framework Edges

- [ ] `no-new-date-in-domain-logic`
- [ ] `no-boundary-try-catch-without-effect-map`

## Boundary Paths

The path-sensitive rules use these boundary paths by default:

- `bin/**`
- `scripts/**`
- `cli/**`
- `**/main.ts`
- `app/api/**/route.ts`
- `server/**`
- `*.test.ts`
- `*.spec.ts`

`no-process-env-direct-read` also allows these configuration paths by default:

- `**/config/**`
- `**/*Config.ts`
- `**/*ConfigLayer.ts`

Supplying `boundaryPaths` or `configPaths` replaces the corresponding default
list for that rule.
