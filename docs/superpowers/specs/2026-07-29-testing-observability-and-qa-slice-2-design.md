# Testing Observability And QA Slice 2 Design

## Goal

Add a strict, test-only lint group that keeps Effect tests explicit about runtime
execution, typed-error assertions, and default service layers.

## Scope

This slice adds three public rules to the existing
`testingObservabilityAndQa` group:

1. `linteffect/no-runpromise-in-non-async-test-body`
2. `linteffect/require-effect-flip-for-error-test`
3. `linteffect/no-test-mock-layer-when-default-available`

They are strict-group rules, not additions to `recommended`. Each rule is
gated by an Effect ecosystem import and applies only to conventional test and
spec files:

- `*.test.*`
- `*.spec.*`
- `**/__tests__/**`

No configurable path option is added in this slice. This keeps the public
contract small and follows the test organisation used by EffectPatterns.

## Rule Contracts

### no-runpromise-in-non-async-test-body

Report a direct `Effect.runPromise(...)` within a test callback when its result
is discarded. Report expression statements and block-bodied callback calls that
are neither awaited nor returned.

Allow:

- `await Effect.runPromise(...)`
- `return Effect.runPromise(...)`
- an expression-bodied test callback whose value is `Effect.runPromise(...)`

The rule recognises direct `it`, `test`, `specify`, and `bench` calls only. It
does not resolve test aliases, higher-order wrappers, or promise values stored
in variables.

### require-effect-flip-for-error-test

Report direct Vitest/Jest-style error assertions with this syntax shape:

```ts
await expect(Effect.runPromise(effect)).rejects
```

The rule only recognises an `expect(...)` call whose argument is a direct
`Effect.runPromise(...)`, followed by a `.rejects` member access. It does not
inspect aliases, helper assertions, `.catch(...)`, or arbitrary promise chains.

The documentation explains the preferred Effect test pattern from
`EffectPatterns-main/docs/SERVICE_PATTERNS.md`: apply `Effect.flip` to an
expected failing Effect, yield the error as a success value in the test Effect,
then assert on its `_tag`, message, and structured fields. `Effect.flip` is not
a general replacement for every rejection assertion; it is the preferred shape
when testing an expected typed Effect failure.

### no-test-mock-layer-when-default-available

Report a direct manual `Layer.succeed(...)` or `Layer.effect(...)` layer passed
to the same `Layer.provide(...)` expression as an explicit `SomeService.Default`
layer. Report the manual layer argument.

Allow manual layers when no explicit `.Default` layer appears in that same
`Layer.provide(...)` expression. This preserves tests that need mocks because a
real dependency is unsafe, absent, or intentionally replaced. The rule does
not infer service metadata, resolve identifiers, or follow layer values through
variables.

## Public Surface

Add the rules to `testingObservabilityAndQaRules`,
`testingObservabilityAndQa`, `ruleGroups`, `presets`, and the standard Oxlint
fixture config. Add `recommendedRules` as the existing recommended set minus
the three Slice 2 test-shape rules, and derive `recommended` from that export.
Keep `allRules` complete. This makes the rules available in the group without
silently changing the existing recommended configuration.

Add dedicated valid and invalid CLI fixtures, an annotated backend
test-shape anti-pattern example for all three rules, README rule entries, and
Roadmap 08 Slice 2 completion markers.

## Verification

Use test-first unit coverage for test/spec gating, direct supported syntax, and
out-of-scope shapes. Verify the group through config exports and an isolated
Oxlint CLI config. `bun run lint:examples` should continue to fail intentionally
and include all three new rule IDs. Finish with the normal package gate:

```bash
bun run test
bun run typecheck
bun run docs:api:check
bun run build
bun run lint
bun run size
bun run pack:dry-run
git diff --check
```
