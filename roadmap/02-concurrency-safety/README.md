# 02 Concurrency Safety

Concurrency rules prevent issues that often pass tests and fail under load:
fiber leaks, uncontrolled parallelism, retry storms, and shared mutable state.

Primary reference:

- `EffectPatterns-main/packages/analysis-core/CONCURRENCY_ANTI_PATTERNS.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [x] | `linteffect/no-unbounded-effect-all` | `unbounded-parallelism-effect-all` | recommended | low | `Effect.all(items.map(...))` without options containing `concurrency` |
| [x] | `linteffect/no-fire-and-forget-fork` | `fire-and-forget-forks` | recommended | medium | `Effect.fork(...)` result unused or not joined/awaited/scoped |
| [x] | `linteffect/no-fork-in-loop` | `forking-inside-loops` | recommended | low | `Effect.fork` inside `for`, `for...of`, `while`, `do` |
| [x] | `linteffect/no-race-without-cleanup` | `racing-without-handling-losers` | strict | medium | `Effect.race` / `raceAll` operands without `Effect.ensuring` or scoped resource handling |
| [ ] | `linteffect/no-blocking-call-in-effect` | `blocking-calls-in-effect-logic` | runtime | medium | sync fs/crypto/compression calls inside `Effect.sync` or `Effect.gen` |
| [ ] | `linteffect/no-promise-concurrency-in-effect` | `promise-concurrency-in-effect` | recommended | medium | `Promise.all`, `allSettled`, `race`, `any` inside Effect code |
| [x] | `linteffect/no-unobserved-fiber` | `ignoring-fiber-failures` | recommended | medium | forked fiber variable never passed to `Fiber.join`, `Fiber.await`, `Fiber.interrupt`, or scoped APIs |
| [x] | `linteffect/no-unbounded-concurrent-retry` | `retrying-concurrently-without-limits` | strict | medium | `Effect.retry` nested under unbounded `Effect.all` / `forEach` |
| [ ] | `linteffect/no-shared-mutable-state-across-fibers` | `shared-mutable-state-across-fibers` | strict | high | outer `let`/`var` mutated from fork/all callbacks |
| [ ] | `linteffect/no-timeout-with-noninterruptible-promise` | `timeouts-without-cancellation-awareness` | strict | high | `Effect.timeout(Effect.promise(...))` or `tryPromise` with no signal parameter |

## Slice Plan

### Slice 1: Controlled Parallelism

- [x] `no-unbounded-effect-all`
- [x] `no-fire-and-forget-fork`
- [x] `no-fork-in-loop`

### Slice 2: Fiber Observation

- [x] `no-race-without-cleanup`
- [x] `no-unobserved-fiber`
- [x] `no-unbounded-concurrent-retry`

### Slice 3: Blocking And Shared State

- [ ] `no-blocking-call-in-effect`
- [ ] `no-promise-concurrency-in-effect`
- [ ] `no-shared-mutable-state-across-fibers`

### Slice 4: Cancellation Awareness

- [ ] `no-timeout-with-noninterruptible-promise`

## Safe Variants

Do not flag:

- `Effect.all(..., { concurrency: n })`
- `Effect.forEach(..., { concurrency: n })`
- `Effect.forkScoped`
- `Effect.forkIn`
- forked fibers followed by `Fiber.join`, `Fiber.await`, or `Fiber.interrupt`
- `Effect.tryPromise({ try: (signal) => fetch(url, { signal }) })`
