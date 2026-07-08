# 11 Behavior Decoration

Behavior decoration rules encode the style-guide pillar that `.pipe()` answers
"how should this effect behave?" Retry, timeout, spans, logging, recovery,
dependency provision, and value transforms should decorate an existing effect
rather than bury workflow.

Primary reference:

- `styleguide.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [ ] | `linteffect/prefer-pipe-for-behavior` | styleguide-pipe-pillar | strict | medium | nested/static behavior calls such as `Effect.retry(program, policy)` where `program.pipe(Effect.retry(policy))` is clearer |
| [ ] | `linteffect/no-workflow-in-behavior-pipe` | styleguide-smell-4 | strict | medium | behavior pipelines containing branching, service lookup, loops, or multiple `Effect.flatMap` workflow steps |
| [ ] | `linteffect/prefer-decorated-effect-before-gen` | styleguide-smell-2 | recommended | medium | repeated retry/timeout/span/logging decorators inside generator yields instead of extracted decorated effects |

## Slice Plan

### Slice 1: Behavior Placement

- [ ] `prefer-pipe-for-behavior`
- [ ] `prefer-decorated-effect-before-gen`
- [ ] `no-workflow-in-behavior-pipe`

## Detection Notes

Behavior operators include:

- error handling: `Effect.catchTag`, `Effect.catchAll`, `Effect.catchSome`
- resilience: `Effect.retry`, `Effect.timeout`, `Effect.timeoutFail`,
  `Effect.race`
- observability: `Effect.withSpan`, `Effect.annotateLogs`, `Effect.tap`,
  `Effect.tapError`
- dependency injection: `Effect.provide`
- value transforms: `Effect.map`, `Effect.mapBoth`, `Effect.as`

Only flag `prefer-pipe-for-behavior` when the first argument is clearly an
existing effect expression. Avoid flagging callback-first APIs or overloads whose
pipe form would be ambiguous.

## Safe Variants

Do not flag:

- already pipeable behavior chains
- short local decorators inside test fixtures
- workflow pipelines where `Effect.flatMap` is the only readable shape until
  `Effect.gen` migration happens
