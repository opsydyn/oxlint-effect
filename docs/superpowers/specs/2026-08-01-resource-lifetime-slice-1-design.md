# Resource Lifetime Slice 1 Design

## Goal

Add the first three current-API Resource Lifetime rules:

- `linteffect/no-manual-resource-close`
- `linteffect/no-unbound-scope`
- `linteffect/no-resource-succeed-escape`

The slice protects cleanup ownership and prevents resources or scopes from
escaping Effect lifecycle management while keeping the rules usable as a
focused `resourceLifetime` preset.

## Context

The implementation is an external Oxlint JavaScript plugin. Rules use the
existing ESLint-style `create(context)` visitors and the repository's AST
helpers. The slice is based on the clean Slice 7 branch and will be submitted
as the next stacked pull request.

The roadmap entry `no-scope-global` is deferred. The supported
`effect@3.21.4` API exports `Scope.make`, `Scope.close`, and `Scope.extend`,
but does not export `Scope.global`; implementing that rule now would create a
public rule with no valid current trigger.

## Detection Contracts

### `no-manual-resource-close`

Default: `recommended`.

Report a call whose non-computed member property is one of:

- `close`
- `destroy`
- `dispose`
- `cleanup`

The receiver must be resource-like according to the shared vocabulary from
Slice 7: `client`, `connection`, `conn`, `pool`, `db`, `database`, `file`,
`socket`, `stream`, `server`, `subscription`, or `handle`. Camel-case names
are tokenised before matching, so `fileHandle.close()` is recognized while
`logger.close()` is not.

The rule requires an Effect ecosystem import and ignores configured boundary
paths. It reports calls in Effect logic, including calls nested in generator
bodies and combinator callbacks.

The following are safe release ownership evidence and are not reported:

- release callbacks passed to `Effect.acquireRelease`,
  `Effect.acquireUseRelease`, or `Effect.acquireReleaseInterruptible`
- callbacks passed to `Effect.addFinalizer`, `Scope.addFinalizer`, or
  `Scope.addFinalizerExit`
- non-resource-like receivers

`Effect.ensuring` is not an exemption. The rule keeps resource ownership in
the acquire/release or Scope finalizer APIs rather than treating arbitrary
manual cleanup as equivalent ownership.

### `no-unbound-scope`

Default: `recommended`.

Report a `Scope.make(...)` call in Effect logic when the created scope has no
static ownership evidence. The rule tracks simple local bindings created from
`Scope.make` and recognizes these safe forms:

- the call is enclosed by `Effect.scoped(...)` or `Layer.scoped(...)`
- the binding is passed to `Scope.close(...)`
- the call is the acquire expression of
  `Effect.acquireRelease(...)`, `Effect.acquireUseRelease(...)`, or
  `Effect.acquireReleaseInterruptible(...)` whose release callback contains a
  matching `Scope.close(...)`

The rule requires an Effect ecosystem import and ignores configured boundary
paths. It remains intentionally conservative: it does not infer ownership
through arbitrary aliases, service implementations, or type information.

### `no-resource-succeed-escape`

Default: `runtime` and included in the focused `resourceLifetime` preset.

Report `Effect.succeed(resourceLike)` when the succeeded expression is a
resource-like identifier or member value using the shared resource
vocabulary. This catches returning a live client, connection, pool, file,
socket, stream, server, subscription, or handle as an ordinary value instead
of keeping its lifetime inside a scoped Effect.

The rule requires an Effect ecosystem import and ignores configured boundary
paths. It does not report literals, ordinary domain values, or resource-like
names in non-Effect modules.

## Public Configuration

Add:

- `resourceLifetimeRules`, containing all three rules
- `resourceLifetime`, a config-shaped preset with the `linteffect` plugin

The focused preset enables all three rules. `recommended` adds only
`no-manual-resource-close` and `no-unbound-scope`; the resource escape rule
remains focused because its identifier-based heuristic is more opinionated.

All three rules accept the existing `{ boundaryPaths: string[] }` option
shape and use the repository's conservative default boundary paths when no
options are supplied.

## QA and Documentation

The slice must include:

- direct unit tests for invalid and safe forms of every rule
- config tests for the new rule group and recommended inclusion/exclusion
- an Oxlint CLI fixture asserting the exact three diagnostics
- annotated backend examples with `EXPECT` and `QA` comments plus safe forms
- README entries explaining each rule and the new preset
- Resource Lifetime roadmap updates, including the deferred `no-scope-global`
  note and Slice 1 completion
- `docs/rule-qa-inventory.json` ownership for all three public rules
- a minor Changeset

The final verification must run the focused test suite, typecheck, build,
publint, Typedoc, size, pack, and the intentional example-lint comparison.

## Non-Goals

- no type-aware resource inference
- no attempt to detect arbitrary resource constructors beyond the shared
  vocabulary
- no implementation of the unavailable `Scope.global` API rule
- no broad `no-resource-without-acquire-release` rule in this slice; that
  remains Slice 2 and must be designed to avoid duplicate reports with the
  Slice 7 concurrent-acquisition rule
