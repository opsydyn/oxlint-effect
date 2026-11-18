# Opt-In Error Cause-Loss Detector

- result: complete locally
- claim: no-error-cause-loss diagnoses visible constructor-input erasure under an explicit retention policy in both supported Effect majors; recommended defaults are unchanged.
- evidence: 632 tests / 5966 expectations, both complete packed-major suites, packed type-aware, types, publint, API docs, package checks, release inventory and the measured 31 KB gate.
- remaining uncertainty: no hosted CI, fresh-session agent adherence, constructor-storage proof, cross-file inference or general test-adequacy qualification is claimed.
- next: assess same-instance ambient service re-provision separately, including intentional environment pinning; pushing and publishing remain separate gates.

## Scope And Policy

Register `linteffect/no-error-cause-loss` in errorModeling, ddd and allRules for
both majors. It is absent from recommended and its typeAware companion.
There are now 147 registered rules, 18 groups and 22 DDD members. Version
applicability totals are 147 legacy and 142 current, retaining five legacy-only
policies. Published 2.2.0 does not contain the new ID; a minor changeset covers
the opt-in group expansion and measured budget revision.

Match actual value-import and parameter bindings for inline synchronous
mapError and broad typed/Cause recovery, including current eager forms.
Inspect direct new-constructor outputs, block returns and conditional branches;
recovery must return Effect.fail(new ...). Passing the original directly or
inside an effective literal object/array field counts as visible retention
input. Field projection and logging alone do not.

Opaque helpers, aliases, dynamic spreads/keys, named handlers, reassigned or
destructured input, async callbacks, generators and factory .make calls remain
unknown or unsupported, not proved safe. Constructors may ignore their inputs.
No autofix is offered. Public capture-and-erase translations may be intentional
outside this policy; clearing a diagnostic never justifies disclosing secrets.
See [ADR 0004](../../adr/0004-opt-in-cause-loss-policy.md).

## Verification

- RED: the real-CLI explicit error-group case produced zero diagnostics before
  implementation, where one cause-loss warning was required. The remaining
  initial explicit-ID failures were unknown-rule failures, not independent
  demonstrations of semantic detection. GREEN includes 15 real-CLI tests,
  a direct unit check and config assertions across both majors.
- Tests cover effective duplicate-property order, projection, arbitrary owned
  field names, import aliases, lexical shadows, type-only imports, unknown
  helpers/spreads, reassignment, logging without retention and own-major APIs.
- Promote the three matched cause-narrowing failures to EXPECT annotations in
  each major. Clean repairs retain identity; the backend reference app contains
  inline warning sites rather than wrappers that cannot demonstrate a warning.
  The existing generic-rethrow corpus records its additional overlapping warning.
- `bun run test`: 632 pass, 0 fail, 5966 expectations across 16 files, using a
  writable temporary npm cache. Root typecheck passes.
- `bun scripts/verify-effect-version-consumers.ts --require-complete`: pinned
  Effect 3.22.1 and 4.0.0 pass declaration, diagnostic, negative-type and runtime
  contracts with the actual packed skill. Both groups verify 22 DDD members and
  the recommended exclusions. The new qualification case expects three bad
  diagnostics, zero clean-control diagnostics and its runtime completion marker.
- `bun run test:type-aware` passes with normal Bun cache access. A sandbox-only
  retry first failed on cache EPERM; it was an environment failure, not a lint
  success. TypeDoc, publint, build and the complete release inventory guard pass.
- Package dry-run/content checks include the corpus and public declarations.
  No dependency upgrade, additional runtime entry or hidden size exclusion.
- Runtime: 131,399 raw bytes; 30,650 Brotli bytes, up 704 from published 2.2.0.
  The explicitly revised cap is 31,000 bytes, leaving 350 bytes of headroom.
  Historical 30 KB qualification records are retained as historical evidence.

Author self-review only; no independent review or live-agent pass is claimed.
The standalone Python skill validator remains unqualified from the previous
slice because PyYAML is unavailable; repository metadata/link and packed-content
tests pass. No push, version bump or publication is part of this local slice.
