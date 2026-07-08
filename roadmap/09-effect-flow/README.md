# 09 Effect Flow

Effect flow rules encode the style-guide pillar that `Effect.gen` owns workflow
and orchestration, while `.pipe()` decorates behavior around an already-defined
effect.

Primary reference:

- `styleguide.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [x] | `linteffect/no-piped-yield-in-gen` | styleguide-smell-2 | recommended | low | repeated `yield* service.pipe(...)` / `yield* effect.pipe(...)` inside one `Effect.gen` body |
| [x] | `linteffect/no-gen-for-mapping` | styleguide-smell-5 | recommended | low | `Effect.gen(function* () { const x = yield* effect; return pureTransform(x); })` with no branching or additional effects |
| [ ] | `linteffect/no-business-logic-in-pipe` | styleguide-smell-4 | strict | medium | `.pipe(Effect.flatMap(...))` callbacks containing branching, service retrieval, or multiple Effect steps |
| [x] | `linteffect/prefer-gen-for-workflow` | styleguide-smell-1 | recommended | medium | long `Effect.flatMap` / `Effect.andThen` / `Effect.tap` chains that model sequential workflow |

## Slice Plan

### Slice 1: Highest-Signal Flow Smells

- [x] `no-piped-yield-in-gen`
- [x] `no-gen-for-mapping`
- [x] `prefer-gen-for-workflow`

### Slice 2: Semantic Workflow Boundaries

- [ ] `no-business-logic-in-pipe`

## Detection Notes

Start with AST-only thresholds:

- report `no-piped-yield-in-gen` after two or more piped yields in the same
  generator body
- report `prefer-gen-for-workflow` after three or more sequencing combinators
  in the same pipeline
- keep `no-business-logic-in-pipe` strict-only because "business logic" is a
  semantic concept; approximate it with branching, service lookup, and multiple
  yielded or returned Effect calls

## Safe Variants

Do not flag:

- a single `yield* effect.pipe(Effect.timeout(...))` when there is no repeated
  pattern in the generator
- `Effect.gen` blocks with branching, loops, service retrieval, or early returns
- small behavior-only `.pipe(...)` chains with retry, timeout, spans, logging,
  recovery, or dependency provision
