# 02 Concurrency Safety

Concurrency rules prevent issues that often pass tests and fail under load:
fiber leaks, uncontrolled parallelism, retry storms, shared mutable state, and
unstructured lifetime ownership.

Primary reference:

- `EffectPatterns-main/packages/analysis-core/CONCURRENCY_ANTI_PATTERNS.md`
- Rust-inspired discipline: lock-across-suspension, shared-state ownership,
  cancellation, backpressure, and scoped resource lifetime.

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [x] | `linteffect/no-unbounded-effect-all` | `unbounded-parallelism-effect-all` | recommended | low | `Effect.all(items.map(...))` without options containing `concurrency` |
| [x] | `linteffect/no-fire-and-forget-fork` | `fire-and-forget-forks` | recommended | medium | `Effect.fork(...)` result unused or not joined/awaited/scoped |
| [x] | `linteffect/no-fork-in-loop` | `forking-inside-loops` | recommended | low | `Effect.fork` inside `for`, `for...of`, `while`, `do` |
| [x] | `linteffect/no-race-without-cleanup` | `racing-without-handling-losers` | strict | medium | `Effect.race` / `raceAll` operands without `Effect.ensuring` or scoped resource handling |
| [x] | `linteffect/no-blocking-call-in-effect` | `blocking-calls-in-effect-logic` | runtime | medium | sync fs/crypto/compression calls inside `Effect.sync` or `Effect.gen` |
| [x] | `linteffect/no-promise-concurrency-in-effect` | `promise-concurrency-in-effect` | recommended | medium | `Promise.all`, `allSettled`, `race`, `any` inside Effect code |
| [x] | `linteffect/no-unobserved-fiber` | `ignoring-fiber-failures` | recommended | medium | forked fiber variable never passed to `Fiber.join`, `Fiber.await`, `Fiber.interrupt`, or scoped APIs |
| [x] | `linteffect/no-unbounded-concurrent-retry` | `retrying-concurrently-without-limits` | strict | medium | `Effect.retry` nested under unbounded `Effect.all` / `forEach` |
| [x] | `linteffect/no-shared-mutable-state-across-fibers` | `shared-mutable-state-across-fibers` | strict | high | outer `let`/`var` mutated from fork/all callbacks |
| [x] | `linteffect/no-timeout-with-noninterruptible-promise` | `timeouts-without-cancellation-awareness` | strict | high | `Effect.timeout(Effect.promise(...))` or `tryPromise` with no signal parameter |

## Concurrency Safety Expansion Backlog

These rules extend the same `concurrencySafety` group with a stronger ownership
and backpressure posture. They should be consumable through
`concurrencySafetyRules` / `concurrencySafety` once implemented, even when their
individual default preset remains `strict` or `runtime`.

| Status | Proposed Rule | Inspiration | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [ ] | `linteffect/no-uninterruptible-concurrent-region` | cancellation discipline | runtime | medium | `Effect.uninterruptible(...)` or pipe argument around `Effect.fork`, `Effect.race`, `Effect.all`, `Effect.forEach`, or `Queue.take` work |
| [ ] | `linteffect/no-unbounded-queue-or-pubsub` | backpressure discipline | runtime | medium | `Queue.unbounded()`, `PubSub.unbounded()`, or unbounded constructors outside tests or explicit boundary files |
| [ ] | `linteffect/no-global-mutable-concurrency-state` | `static mut` / shared-state discipline | strict | high | module-scope `let`, `Map`, `Set`, or object mutation from concurrent Effect callbacks |
| [ ] | `linteffect/no-yield-with-held-semaphore-permit` | lock-across-suspension discipline | strict | high | `yield* Semaphore.withPermits(...)` / acquire-permit style code whose callback contains unrelated `yield*` or forked work |
| [ ] | `linteffect/no-yield-with-held-mutable-ref` | mutable-reference-across-suspension discipline | strict | high | mutable state handles captured before a later `yield*` in the same `Effect.gen` block |
| [ ] | `linteffect/no-unscoped-background-fiber` | structured ownership / RAII | strict | medium | forked effects stored, returned, or discarded without scoped lifetime, supervisor, join, await, or interrupt evidence |
| [ ] | `linteffect/no-manual-deferred-coordination` | ad hoc synchronization discipline | strict | high | `Deferred.make` / `Deferred.unsafeMake` used as a latch without timeout, interruption, or scoped ownership nearby |
| [ ] | `linteffect/no-acquire-without-scoped-release` | scoped resource lifetime discipline | runtime | high | resource acquisition calls in concurrent work without `Effect.acquireRelease`, `Effect.scoped`, or finalizer evidence |

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

- [x] `no-blocking-call-in-effect`
- [x] `no-promise-concurrency-in-effect`
- [x] `no-shared-mutable-state-across-fibers`

### Slice 4: Cancellation Awareness

- [x] `no-timeout-with-noninterruptible-promise`

### Slice 5: Ownership And Backpressure

- [ ] `no-uninterruptible-concurrent-region`
- [ ] `no-unbounded-queue-or-pubsub`
- [ ] `no-global-mutable-concurrency-state`

### Slice 6: Held State Across Suspension

- [ ] `no-yield-with-held-semaphore-permit`
- [ ] `no-yield-with-held-mutable-ref`
- [ ] `no-unscoped-background-fiber`

### Slice 7: Coordination And Acquisition Discipline

- [ ] `no-manual-deferred-coordination`
- [ ] `no-acquire-without-scoped-release`

## Safe Variants

Do not flag:

- `Effect.all(..., { concurrency: n })`
- `Effect.forEach(..., { concurrency: n })`
- `Effect.forkScoped`
- `Effect.forkIn`
- forked fibers followed by `Fiber.join`, `Fiber.await`, or `Fiber.interrupt`
- `Effect.tryPromise({ try: (signal) => fetch(url, { signal }) })`
- bounded `Queue.bounded(n)` / `PubSub.bounded(n)`
- scoped acquisition with `Effect.acquireRelease`, `Effect.scoped`, or
  `Effect.addFinalizer`
