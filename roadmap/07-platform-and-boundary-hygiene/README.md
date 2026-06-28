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
| [ ] | `linteffect/no-node-fs-in-effect-code` | `node-fs` | recommended | low | `node:fs`, `node:fs/promises`, `fs` imports in Effect code |
| [ ] | `linteffect/no-node-platform-in-shared-code` | `node-platform-in-shared-code` | strict | medium | Node-only imports outside app/boundary paths |
| [ ] | `linteffect/no-json-parse-without-schema` | `schema-decode-unknown` | recommended | medium | `JSON.parse` without nearby `Schema.decodeUnknown` or Schema import |
| [ ] | `linteffect/no-date-now-in-effect` | Clock guidance | recommended | low | `Date.now()` inside `Effect.sync`, `Effect.gen`, or service methods |
| [ ] | `linteffect/no-new-date-in-domain-logic` | time modeling | ddd | medium | `new Date()` inside domain/service logic instead of Clock/DateTime |
| [ ] | `linteffect/no-process-env-direct-read` | config handling | strict | medium | `process.env.*` outside config service/layer files |
| [ ] | `linteffect/no-boundary-try-catch-without-effect-map` | boundary guidance | strict | medium | boundary `try/catch` that does not run or map an Effect program |
| [ ] | `linteffect/no-hidden-effect-execution` | hidden-effect-execution | recommended | medium | functions that call `Effect.run*` but are not named/located as boundaries |

## Slice Plan

### Slice 1: Platform Substitution

- [ ] `no-node-fs-in-effect-code`
- [ ] `no-json-parse-without-schema`
- [ ] `no-date-now-in-effect`

### Slice 2: Boundary Clarity

- [ ] `no-node-platform-in-shared-code`
- [ ] `no-process-env-direct-read`
- [ ] `no-hidden-effect-execution`

### Slice 3: Time And Framework Edges

- [ ] `no-new-date-in-domain-logic`
- [ ] `no-boundary-try-catch-without-effect-map`

## Boundary Paths

Share boundary detection with Correctness Core:

- `bin/**`
- `scripts/**`
- `cli/**`
- `**/main.ts`
- `app/api/**/route.ts`
- `server/**`
- `*.test.ts`
- `*.spec.ts`

Add config options before enabling strict path-sensitive rules in public presets.

