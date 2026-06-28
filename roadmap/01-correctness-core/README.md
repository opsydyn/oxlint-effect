# 01 Correctness Core

Correctness rules protect Effect execution semantics. These should mostly land
in `recommended` because they catch bugs rather than preferences.

Primary references:

- `EffectPatterns-main/packages/analysis-core/TOP_10_CORRECTNESS_ANTI_PATTERNS.md`
- `EffectPatterns-main/packages/analysis-core/ALL_ANTI_PATTERNS_REFERENCE.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [x] | `linteffect/no-run-effect-outside-boundary` | `run-effect-outside-boundary` | recommended | medium | `Effect.runPromise`, `runSync`, `runFork` outside boundary paths |
| [x] | `linteffect/no-yield-without-star-in-effect-gen` | `yield-instead-of-yield-star` | recommended | low | `YieldExpression` without `asteriskToken` inside `Effect.gen` |
| [x] | `linteffect/no-throw-in-effect-logic` | `throw-inside-effect-logic` | recommended | low | `ThrowStatement` inside `Effect.gen` or Effect combinator callbacks |
| [x] | `linteffect/no-async-effect-combinator-callback` | `async-callbacks-in-effect-combinators` | recommended | low | `async` callback passed to Effect combinators |
| [x] | `linteffect/no-or-die-outside-boundary` | `or-die-outside-boundaries` | recommended | medium | `.pipe(Effect.orDie*)` or `Effect.orDie*` outside boundary paths |
| [x] | `linteffect/no-swallowed-catch-all` | `swallowing-errors-in-catchall` | recommended | medium | `Effect.catchAll` returning succeed/void with no log, telemetry, or re-fail |
| [x] | `linteffect/no-effect-ignore` | `effect-ignore-on-failable-effects` | strict | medium | `Effect.ignore` calls, with allowlist for explicit comments |
| [x] | `linteffect/no-try-catch-in-effect-logic` | `try-catch-inside-effect-logic` | recommended | low | `TryStatement` inside Effect code, lower severity for boundaries |
| [x] | `linteffect/no-promise-api-in-effect-logic` | `promise-apis-inside-effect-logic` | recommended | medium | `Promise.all`, `.then`, `.catch`, `.finally` inside Effect code |
| [x] | `linteffect/no-public-generic-effect-error` | `public-apis-returning-generic-error` | ddd | medium | exported functions returning `Effect.Effect<_, Error>` |

## Slice Plan

### Slice 1: Execution Semantics

- [x] `no-yield-without-star-in-effect-gen`
- [x] `no-async-effect-combinator-callback`
- [x] `no-run-effect-outside-boundary`

### Slice 2: Error Escapes

- [x] `no-throw-in-effect-logic`
- [x] `no-or-die-outside-boundary`
- [x] `no-swallowed-catch-all`

### Slice 3: Promise And Imperative Escape Hatches

- [x] `no-effect-ignore`
- [x] `no-try-catch-in-effect-logic`
- [x] `no-promise-api-in-effect-logic`

### Slice 4: Public Error Contract

- [x] `no-public-generic-effect-error`

## Boundary Heuristics

Treat these as boundary contexts by default:

- `bin/**`
- `scripts/**`
- `cli/**`
- `**/main.ts`
- `**/index.ts` only when it calls a `main` program
- `app/api/**/route.ts`
- `server/**`
- `*.test.ts` and `*.spec.ts`

Rules with boundary exceptions should expose a helper so all boundary-aware
rules stay consistent.
