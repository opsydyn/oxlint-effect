# ADR 0003: Require Evidence For Concurrency Diagnostics

## Status

Accepted, 2026-11-16, for the approved three-item concurrency accuracy slice.

## Context

The race rule requires cleanup even for pure or opaque operands. Collection
mutation rules also warn on sequential defaults, and legacy state checks compare
names instead of bindings. Name-only API matching misses import aliases and can
attribute unrelated, shadowed APIs to Effect.

## Decision

Apply these changes to both supported majors, preserving rule IDs and presets:

- `no-race-without-cleanup` requires a visible resource acquisition in a raced
  branch and no visible release owner around that acquisition. Pure and opaque
  tasks are clean. A finalizer on the other branch cannot suppress the warning.
- The two shared/global mutation rules require an inline fork or an explicit
  numeric collection budget above one, global Infinity, or literal unbounded.
  Omitted/one/opaque budgets do not justify a parallel-write warning. Resolve
  lexical bindings for both majors; global means module/global scope. Include
  visible const containers, exclude worker-local and unexecuted callback writes.
- These three rules resolve value imports from `effect` and `effect/Effect`,
  including named aliases, namespace imports and named subpath operations.
  Type-only imports and shadowed bindings are not runtime API evidence. Recognise
  direct, curried and terminal pipe forms without changing the original AST.

The resolver stays local to these three rules. Other rule families retain their
existing recognition policy. Consumers still select Effect 3 explicitly.

## Boundaries And Alternatives

Verdict: safe with noted risk. There are no new dependencies or runtime APIs.
The plugin reads the consumer's scope graph; example consumers validate its
packed API, not an imported checkout. Keep pinned versions and the 30 KB cap.

Blanket cleanup requirements were rejected because races already interrupt
losers. Blanket mutation warnings confuse sequential state with concurrent work.
A plugin-wide resolver rewrite would exceed this slice and change unqualified
rule contracts. Type-checker or cross-file analysis remains separate work.

Resource names, inline construction and cleanup wrappers remain heuristics.
Unknown tasks/budgets are not proof of safety; wrappers do not prove that a
matching release executes. Stored/re-exported aliases, computed API members,
CommonJS, general call graphs and object property writes are not inferred.
Race variants retain first-success versus first-completion behaviour.

## Acceptance And Recovery

Require failing real-CLI regressions before implementation, clean controls for
all three policies, per-major packed anti-pattern and runtime checks, unchanged
rule/group registration, root tests/types/docs, package lint and size gates.
Record final measurements in the completion report. Do not push or publish.

An explicit revert can restore the previous policy; no existing rule or group
is removed. Publish the default diagnostic changes through a minor changeset.

## Sources

- [Effect 4 concurrency](https://effect.website/docs/v4/concurrency/basic-concurrency)
- [Effect 3 concurrency](https://effect.website/docs/v3/concurrency/basic-concurrency)
