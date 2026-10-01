# Recovery And Runtime Qualification

Date: 2026-10-01. Local macOS qualification; no push, remote CI or publication.

## Scope

`no-catchall-generic-rethrow`, `no-early-catchall-null` and
`no-run-effect-outside-boundary` have scoped qualification against packed
consumers pinned to Effect 3.21.4 and 4.0.0 with Oxlint 1.71.0.

- Plain recovery recognises `catchAll` under v3 and `catch` under v4; expression
  and block-return callbacks, direct and piped forms, original/tagged-error
  clean controls and nested unrelated callback exclusions are tested.
- Fallback failures cover null, undefined and named fallback/default identifiers.
  Default boundaries, custom replacements and empty path options are tested.
- All six ordinary runner executions warn outside boundaries for each major.
  All six v4 immediate `run*With(context)(program)` executions warn once.
  Factory creation and callback interruptor invocation do not count as execution.
- JSON diagnostic gates assert exact totals and filenames, with same-process
  matching/opposite-major recovery policies and cross-negative boundary probes.
- Runtime controls assert original failure identity, mapped source cause and
  permitted null fallback. No runner anti-pattern function is executed.

With signatures were inspected in pinned Effect 4.0.0 `src/Effect.ts`:
`runForkWith`, `runCallbackWith`, `runPromiseWith`, `runPromiseExitWith`,
`runSyncWith`, `runSyncExitWith` all accept context first and return a runner.
See [Effect runtime documentation](https://effect.website/docs/v4/runtime) and
[error migration guidance](https://github.com/Effect-TS/effect/blob/main/migration/error-handling.md).
The installed 4.0.0 package is the signature authority for these fixtures.

## Evidence

- RED recovery tests: missing versioned warnings and an erroneous nested callback
  report; GREEN after version selection, scoped return inspection and path repair.
- RED runner tests: missing With reports and unconditional boundary warnings;
  GREEN after executable-runner descriptor and path handling.
- Packed QA initially rejected extensionless config import under Node; explicit
  `.ts` config import plus no-emit compiler support repaired it.
- RED inventory test rejected pending entries; GREEN after attaching packed evidence.
- `bun run test`: 462 pass, 0 fail across 9 files.
- `bun run typecheck`, build, publint, API docs, pack dry-run: passing.
- `bun run test:effect-versions`: both pinned majors pass declarations,
  literal counts, clean controls, overrides, invalid options and runtime contracts.
- `bun run test:type-aware`: separate packed legacy opt-in consumer passes.
- The two changed legacy backend files typecheck; real Oxlint confirms one
  warning for each added headline anti-pattern in the reference application.
- Relative documentation links resolve and `git diff --check` passes.
- Fresh built package: 26.57 kB brotlied against the unchanged 27 kB cap.
- Release guard exits 1 as intended: package 1.2.0 cannot publish v4 defaults.
  Remaining qualification entries also block the eventual 2.0.0 release.

## Rulings And Limits

- Anchor leading-globstar patterns: `**/main.ts` previously matched the suffix
  of `domain.ts`, wrongly exempting a domain file. This shared path correction
  is covered by domain/default/custom path tests and the full legacy suite.
  Cost if wrong: changed boundary exemption; do not treat it as a migration warning.
- Runner boundary exemptions are an intentional correction in both majors, not
  unchanged legacy behaviour. Existing messages and rule IDs are retained.
- With context is an explicit environment source; missing Layer provision skips
  these executions conservatively, not as proof that their contexts are complete.
- Stored runner aliases, renamed imports and computed properties remain outside
  this qualified syntax scope. Testing-group `runPromiseWith` recognition remains
  a follow-on item. Distinct recovery operators are deliberately not folded into
  plain catch; other recovery tables remain unaudited.
- Four transitive runner consumers have synthetic regression controls, not full
  major qualification. Primary legacy backend examples remain Effect 3-labelled;
  the pinned Effect 4 consumer carries this batch's first-class v4 examples.
- Inventory: 146 registered rules; v4 has 4 scoped qualified, 137 pending and
  5 not-applicable entries. Only the three headline entries advanced in this batch.

## Independent Review

One fresh, read-only reviewer examined `c2cc71f..4919a1c` plus all tracked and
untracked Task 3 changes. No findings. The reviewer independently ran all 462
tests, 54 parsed fixture/rule count checks, recovery fixture typechecks and
runtime contracts. Parsed nested functions, generators, object/class methods
remained clean; a whole-expression callback interruptor probe reported only
the inner execution.

Those extra parsed method-scope and whole-expression probes are not persisted
as regression tests; the committed suite covers nested callbacks and explicit
visitor execution/interruptor controls. The reviewer did not rerun fresh packed
installs; the main implementation run supplied the packed-major evidence above.
No deferred correctness findings or fixes were required.
