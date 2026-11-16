# Concurrency Accuracy

- result: complete
- claim: the approved race, mutation-scheduling and binding-recognition slice is implemented locally for both supported majors, with examples and documentation.
- evidence: 611 root tests / 5725 expectations; both complete packed majors; packed type-aware; types, publint, TypeDoc, package dry-run, release inventory and size gates.
- remaining uncertainty: syntax-local ownership, opaque code and unqualified newer Effect versions; no independent review or hosted CI was run for this commit.
- next: needs follow-up; separately authorise push/release of the pending minor changeset.

## Policy And Boundaries

The same three rule IDs and preset memberships remain. Race warnings now require
visible resource-shaped acquisition without an owner around its branch; pure
and opaque races need no redundant cleanup. Another branch's finalizer does not
count. Resource-shaped Error/Exception constructors remain data, not acquisitions.
Scope/finalizer markers and resource names are still heuristics, not release proof.

Shared/global writes require an inline supported fork or a visible parallel
collection budget. Sequential omission/one and opaque/overridden budgets stay
clean. Both majors resolve lexical variables and const containers; global means
module/global scope. Worker-local/shadowed bindings and ordinary unused functions
are excluded. Captured parallel writes still warn; use atomic Ref or immutable
aggregation rather than treating a finite budget as race prevention.

Only these three rules resolve real value imports, named aliases, package and
Effect subpath namespaces, named subpath operations and direct/curried/terminal
pipe forms. Type-only and shadowed bindings are excluded. Stored/re-exported
aliases, computed members, CommonJS, arbitrary call graphs and property writes
are not inferred. Unknown code is not proof of safety.

## Regression And Verification

- New actual-Oxlint regression suite initially had 10 failures and 2 passes,
  exposing the intended pure-race, sequential, alias and shadowing defects.
- Additional RED/GREEN controls exposed resource-shaped domain errors. New
  constructors still warn for visible clients; FileError data stays clean.
- All 14 new tests use actual CLI scope analysis, not mocked import bindings.
  Existing synthetic unit fixtures were updated to model real lexical references.
- `bun run test`: 611 pass, 0 fail, 5725 expectations across 14 files.
- `bun scripts/verify-effect-version-consumers.ts --require-complete`: both pinned
  Effect 3.22.1 / 4.0.0 consumers pass. Includes frozen installs, packed types,
  exact bad/clean counts, opposite-major contracts, annotation examples, ordered
  sequential/parallel results, atomic updates, failure identity and loser release.
- `bun run test:type-aware`, `bun run typecheck`, `bun run build`, `bun run lint`,
  `bun run docs:api:check`, package dry-run and release inventory guard pass.
- `bun run size`: 29,946 Brotli bytes / 30,000; 128,955 raw bytes. The cap is
  unchanged and headroom is only 54 bytes. No dependency changes were needed.
- `git diff --check` passes. Package dry-runs use a writable temporary npm cache.

The packed matrix caught historical sequential and opposite-policy warning
expectations; these were corrected to the new semantics, not suppressed.
Author self-review covered scope, AST ownership, binding identity, diagnostic
counts, package size and delivery. No independent review is claimed. No push,
version bump, publication, dependency upgrade or Bun-native qualification belongs
to this local slice. ADR 0003 records the decision and alternatives.
