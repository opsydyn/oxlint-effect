# Concurrency Safety Slice 6 And Stacked Pull Requests

## Status

Approved design. Implementation is gated on a written plan and will be carried
out through a short-lived stacked pull request trial.

## Context

Roadmap 02 has completed controlled parallelism, fiber observation, blocking
and shared-state checks, cancellation awareness, and the first ownership and
backpressure rules. Slice 6 covers the next three strict rules:

- `linteffect/no-yield-with-held-semaphore-permit`
- `linteffect/no-yield-with-held-mutable-ref`
- `linteffect/no-unscoped-background-fiber`

The repository currently works directly on `main`. The next few slices will
trial GitHub stacked pull requests using the official `github/gh-stack`
extension. Each child pull request will target the branch immediately below it,
so each review sees one focused diff while the complete stack remains
integratable.

## Goals

- Add three conservative strict concurrency rules without duplicating existing
  `no-fire-and-forget-fork` or `no-unobserved-fiber` diagnostics.
- Expose the rules through the existing `concurrencySafetyRules`,
  `concurrencySafety`, `allRules`, and strict configuration surfaces.
- Keep every rule covered by unit tests, the CLI integration contract, an
  annotated anti-pattern fixture, README documentation, roadmap status, and
  the rule QA inventory.
- Trial a three-layer stack:
  - `concurrency/slice-6-held-state` targets `main`.
  - `concurrency/slice-7-coordination` targets the Slice 6 branch.
  - `resource/slice-1-cleanup` targets the Slice 7 branch.
- Keep the existing Changesets release workflow unchanged. Each slice may carry
  its own Changeset; versioning and npm publication happen only after the stack
  reaches `main`.

## Non-goals

- Do not diagnose arbitrary custom lock, mutex, semaphore, or reference
  wrappers.
- Do not treat ordinary `Ref.get`, `Ref.set`, `Ref.update`, or `Ref.modify`
  as holding a mutable borrow across a yield. Effect `Ref` operations are
  atomic operations, not borrowed mutable references.
- Do not change the public default severity of the three rules. They remain
  strict opt-in rules.
- Do not replace or broaden the existing fork ownership rules.
- Do not alter release workflow configuration during this trial.

## Rule Semantics

### `no-yield-with-held-semaphore-permit`

Recognise direct Effect semaphore coordination:

- a member call named `withPermit` or `withPermits` on a direct semaphore
  expression;
- `Effect.Semaphore` instances using `.withPermit(s)(effect)`;
- direct `TSemaphore.withPermit(s)(semaphore, effect)` calls where the AST
  exposes that shape.

Report the enclosing coordinated effect only when its callback/effect argument
contains a direct high-risk suspension or concurrency operation:

- `Effect.sleep`, `Effect.await`, `Effect.promise`, or
  `Effect.tryPromise`;
- `Effect.fork`, `Effect.forkDaemon`, or `Effect.forkScoped`;
- `Effect.all`, `Effect.forEach`, or `Effect.race`;
- `Queue.take` or `Deferred.await`;
- an `Effect.gen` yield of one of the above.

Do not report a permit region containing only synchronous computation, atomic
`Ref` updates, a small pure mapping, or an explicitly scoped release pattern.
The rule is intentionally strict and syntax-only; it does not infer whether a
particular awaited Effect is fast.

### `no-yield-with-held-mutable-ref`

Use the roadmap rule ID for the coordination hazard, but target the actual
Effect API that holds the synchronization boundary: direct
`SynchronizedRef.modifyEffect`, `SynchronizedRef.modifySomeEffect`,
`SynchronizedRef.updateEffect`, and `SynchronizedRef.updateAndGetEffect`
callbacks, including method-style calls with those names.

Report when the effect callback contains the same high-risk suspension or
concurrency operations as the semaphore rule. This catches an asynchronous
operation executed while `SynchronizedRef` holds its internal semaphore.

Allow ordinary `Ref` operations and synchronous
`SynchronizedRef.modify` / `SynchronizedRef.update` callbacks. They do not
hold a mutable JavaScript reference across an Effect suspension.

### `no-unscoped-background-fiber`

Report direct `Effect.forkDaemon(...)` calls. A daemon fiber is deliberately
detached from the surrounding scope and has no lexical lifetime owner.

Allow `Effect.forkScoped(...)`, `Effect.forkIn(...)`, ordinary `Effect.fork(...)`
handled by the existing ownership rules, and explicit supervisor composition.
This first slice does not attempt whole-program tracking of custom supervisors
or returned fibers.

## Public Surface

Add the three rule implementations to the internal registry and
`concurrencySafetyRules`. The config-shaped `concurrencySafety` preset must
include them at `"error"` like the other named group rules, while the general
`recommendedRules` preset must remain unchanged. The rules must also appear in
`allRules`, generated declarations, README tables, and the QA inventory.

## Testing And QA

For each rule:

- add direct rule unit tests for the report shape;
- add safe-variant tests for the explicitly allowed cases;
- add CLI integration coverage for the combined concurrency fixture;
- add an adjacent `EXPECT` and `QA` annotation to
  `examples/backend/concurrency-safety-anti-patterns.ts`;
- verify the example diagnostic is observed by the existing expected-versus-
  observed comparison;
- update the README explanation and the completed Slice 6 roadmap rows;
- map the rule to the completed Roadmap 02 README in
  `docs/rule-qa-inventory.json`;
- add a minor Changeset because these are new public rules.

The examples remain intentionally lint-invalid and parse-only.

## Stacked Pull Request Trial

Install and use `github/gh-stack` for the trial. The stack is created only
after the working tree is clean and the current `main` baseline is verified.

1. Create `concurrency/slice-6-held-state` from `main`, implement and verify
   Slice 6, and open its PR against `main`.
2. Create `concurrency/slice-7-coordination` from the Slice 6 branch, implement
   Roadmap 02 Slice 7, and open its PR against Slice 6.
3. Create `resource/slice-1-cleanup` from the Slice 7 branch, implement the
   first Resource Lifetime slice, and open its PR against Slice 7.
4. Review each PR as its own diff. Merge the stack in order, or use GitHub's
   stack merge action once every layer has passed CI.
5. Confirm the release workflow only publishes after the stack reaches `main`.

If the preview extension is unavailable or its remote API is incompatible with
the repository, fall back to ordinary `gh pr create --base <parent-branch>`
commands while preserving the same branch and dependency structure.

## Acceptance Criteria

- Three new strict rules are exported and included in the concurrency group.
- Direct high-risk suspension inside semaphore and synchronized-reference
  critical regions is reported.
- Plain `Ref` operations, synchronous updates, scoped forks, and explicit
  `forkIn` usage are not reported by these rules.
- `forkDaemon` is reported as unscoped background work.
- Existing fork, fiber, concurrency, and package tests remain green.
- Rule QA inventory, README, roadmap, examples, Changeset, and generated build
  artifacts are consistent.
- The first three slices are represented as a GitHub stacked PR chain, with
  each child PR targeting the layer below it.
