# Concurrency Safety Slice 7: Coordination And Acquisition Discipline

## Status

Approved design. Implementation is gated on a written implementation plan.

## Context

The `0.7.0` release merged Concurrency Safety Slice 6 into `main`. Roadmap 02
now has two unchecked expansion rules that address the next ownership boundary:

- `linteffect/no-manual-deferred-coordination`
- `linteffect/no-acquire-without-scoped-release`

The rules will follow the plugin's existing import-gated, type-free AST
architecture. They are intended to catch obvious coordination and lifetime
hazards without claiming to prove ownership for arbitrary application
abstractions.

## Goals

- Detect unbounded local `Deferred` latch coordination when no timeout,
  interruption, scope, or finalizer evidence is visible.
- Detect resource-like acquisition performed inside concurrent Effect work
  without a visible scoped release boundary.
- Keep both rules conservative enough to avoid diagnosing ordinary domain code,
  custom abstractions, or acquisitions that occur outside concurrent work.
- Expose both rules through `concurrencySafetyRules` and the public rule map.
- Keep the strict rule out of `recommended`, while preserving the existing
  convention that runtime concurrency rules are included in `recommended`.
- Provide unit, CLI, config, example, documentation, roadmap, QA-inventory,
  and release evidence for each rule.

## Non-goals

- Do not perform TypeScript type analysis or whole-program ownership inference.
- Do not follow arbitrary aliases across functions, object properties, or
  module boundaries.
- Do not diagnose every `Deferred.await`; established cross-service signals may
  be valid when their constructor cannot be connected to a local latch shape.
- Do not infer that an arbitrary function such as `makeThing()` returns a
  resource. Resource matching is limited to the central verb and resource
  vocabularies described below.
- Do not implement the remaining Resource Lifetime roadmap rules in this slice.
- Do not change release workflow or publish configuration.

## Rule Semantics

### `no-manual-deferred-coordination`

This is a strict coordination rule. It targets a local latch shape rather than
all uses of `Deferred`.

Recognise direct namespace constructor calls with these supported spellings:

- `Deferred.make(...)`
- `Deferred.unsafeMake(...)`
- `Deferred.makeUnsafe(...)` for compatibility with Effect versions that use
  that spelling.

Record a direct local binding when its initializer contains one of those calls,
including the common generator form:

```ts
const ready = yield* Deferred.make<void>();
```

Within the same function or generator scope, follow only direct identifier
uses of that binding in `Deferred.await(ready)`. Report the await when it is not
structurally protected by one of the following visible markers:

- `Effect.timeout(...)`, `Effect.timeoutOption(...)`,
  `Effect.timeoutFail(...)`, `Effect.timeoutFailCause(...)`, or
  `Effect.timeoutTo(...)`;
- `Effect.race(...)`, `Effect.raceFirst(...)`, or `Effect.raceAll(...)` used as
  an interruption boundary;
- `Effect.interruptible(...)` around the await;
- `Effect.scoped(...)` or a pipe-style `Effect.scoped` boundary enclosing the
  await;
- `Effect.addFinalizer(...)` or `Scope.addFinalizer(...)` in the same local
  effect body, with the finalizer callback referencing the same Deferred
  binding.

The rule reports the await expression so the fix can add a bounded or owned
  boundary locally. It does not report an isolated constructor, a cross-function
  alias, or an await whose originating local binding cannot be established.
Each unprotected await receives at most one diagnostic.

Default: `strict`. The rule belongs to `concurrencySafety` and is excluded from
`recommended` through the existing strict-rule filtering.

### `no-acquire-without-scoped-release`

This is a runtime rule for acquisition inside concurrent work. Inspect direct
work passed to these Effect concurrency boundaries:

- `Effect.fork(...)`, `Effect.forkScoped(...)`, and `Effect.forkDaemon(...)`;
- `Effect.all(...)` and `Effect.forEach(...)`;
- `Effect.race(...)`, `Effect.raceFirst(...)`, and `Effect.raceAll(...)`.

Within those work trees, recognise a direct call when its callee name contains
at least one acquisition verb and one resource term. The initial central
vocabulary is:

- verbs: `open`, `connect`, `create`, `start`, `listen`, `subscribe`,
  `acquire`;
- resource terms: `client`, `connection`, `conn`, `pool`, `db`, `database`,
  `file`, `socket`, `stream`, `server`, `subscription`, `handle`.

This catches names such as `openConnection`, `createClient`,
`connectToDatabase`, and `acquireHandle`, including calls nested inside an
Effect promise adapter. It intentionally does not infer resources from a
generic `make` function or from arbitrary object types.

Do not report the acquisition when the same value is visibly owned by one of
these local structures:

- the acquisition is the acquire argument of `Effect.acquireRelease(...)` or
  `Effect.acquireUseRelease(...)`;
- the acquisition is enclosed by `Effect.scoped(...)`, including the pipe form;
- a local binding for the acquisition is followed in the same effect body by
  `Effect.addFinalizer(...)` or `Scope.addFinalizer(...)` whose callback
  references that binding.

Report the acquisition call, not the outer concurrency combinator. If several
concurrent roots contain the same acquisition node, deduplicate the diagnostic
so each acquisition is reported once.

Default: `runtime`. The rule belongs to `concurrencySafety` and remains in the
recommended runtime surface, matching the package's current preset convention.

## Public Surface

Add both implementations to the internal `rules` registry and
`concurrencySafetyRules`. Add `no-manual-deferred-coordination` to the strict
concurrency rule names so `recommendedRules` excludes it. Leave
`no-acquire-without-scoped-release` outside the strict list so it remains in
`recommendedRules`.

Both rules must appear in `allRules`, generated declarations, the README rule
table, and `docs/rule-qa-inventory.json`. Existing exports and existing rule
behaviour must remain unchanged.

## Testing And QA

### Direct rule tests

`tests/plugin.test.ts` must cover:

- local `Deferred.make` and unsafe-constructor latch positives;
- timeout, race, interruptible, scoped, and matching-finalizer negatives;
- cross-function and unrelated-binding negatives;
- import gating and one-report-per-await behaviour;
- acquisition positives under fork, all, forEach, and race work;
- resource names from the central vocabulary and nested Promise adapters;
- acquire/release, scoped, pipe-scoped, and matching-finalizer negatives;
- generic factory and non-concurrent acquisition negatives;
- deduplication when one acquisition is visited through nested concurrent roots.

### Oxlint fixture

Add `tests/fixtures/oxlint/concurrency-safety-slice-7.ts` with intentionally
invalid and valid examples, and a focused config enabling the two new rules.
The integration test must assert the exact sorted diagnostic IDs and counts.

### Annotated examples

Extend `examples/backend/concurrency-safety-anti-patterns.ts` with named
anti-pattern exports and `EXPECT` annotations for both rules. Keep safe
variants in the same file so the example corpus demonstrates both the warning
and the intended ownership shape. The examples remain intentionally
lint-invalid and are not runtime demos.

### Documentation and release

- Add concise README entries grouped under Concurrency Safety.
- Mark the two Slice 7 roadmap rows complete only after all gates pass.
- Map both IDs to `roadmap/02-concurrency-safety/README.md` in the QA
  inventory.
- Add a minor Changeset for the two new public rules.

## Verification Gates

The implementation plan must require these commands after the final edits:

```text
bun test
bun run typecheck
bun run build
bun run lint
bun run docs:api:check
bun run size
bun run pack:dry-run
bun run lint:examples
git diff --check
```

The package must be built before packaging and the isolated CLI fixture must be
run independently of the intentionally invalid example corpus.

## Acceptance Criteria

- Both rule IDs are exported and present in the concurrency group.
- Unprotected local Deferred latch awaits are reported, while explicit bounded
  or owned variants are not.
- Resource-like acquisition inside concurrent Effect work is reported unless a
  matching scoped release or finalizer path is visible.
- Custom abstractions, generic factories, non-concurrent acquisition, and
  unrelated Deferred usage remain unreported.
- The strict and recommended preset contracts match the public surface above.
- Unit tests, CLI integration, examples, documentation, QA inventory, build,
  and package gates pass.
- A minor Changeset documents the new concurrency-safety diagnostics.
