# 10 Pure Transformation

Pure transformation rules encode the style-guide pillar that `flow()` owns
named, reusable, pure data transformations such as DTO mapping, validation, and
business calculations.

Primary reference:

- `styleguide.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [ ] | `linteffect/prefer-flow-for-pure-pipeline` | styleguide-flow-pillar | strict | medium | nested pure call towers such as `toCard(withPrice(withImages(value)))` above a depth threshold |
| [x] | `linteffect/no-large-anonymous-flow` | styleguide-smell-3 | recommended | low | `flow(...)` with many steps used inline or without a descriptive binding |
| [x] | `linteffect/no-effect-in-flow` | styleguide-flow-boundary | recommended | low | `Effect.*`, `yield`, `async`, logging, retry, spans, or dependency access inside `flow(...)` arguments |
| [x] | `linteffect/prefer-named-flow` | styleguide-flow-pillar | strict | medium | non-trivial `flow(...)` passed directly as a callback or combinator argument |

## Slice Plan

### Slice 1: Flow Boundary Safety

- [x] `no-large-anonymous-flow`
- [x] `no-effect-in-flow`
- [x] `prefer-named-flow`

### Slice 2: Pure Pipeline Discovery

- [ ] `prefer-flow-for-pure-pipeline`

## Detection Notes

Prefer conservative thresholds:

- `no-large-anonymous-flow`: five or more function arguments in `flow(...)`
- `prefer-named-flow`: three or more function arguments when `flow(...)` is
  passed directly to `Effect.map`, array methods, or other callbacks
- `prefer-flow-for-pure-pipeline`: nested call depth of three or more with no
  `Effect`, `Promise`, `await`, `yield`, or known side-effect APIs

## Safe Variants

Do not flag:

- short local `flow(...)` expressions with one or two steps
- `pipe(value, fn1, fn2)` where the value is immediately transformed once
- effectful workflows, branching, dependency retrieval, retries, spans, logging,
  or async work; those belong to Effect Flow / Behavior Decoration rules
