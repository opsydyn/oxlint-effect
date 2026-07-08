# 12 Style Separation

Style separation rules are strict readability heuristics. They enforce the
style-guide principle that each function should have one obvious style:
workflow, behavior decoration, pure transformation, or dependency graph
construction.

Primary reference:

- `styleguide.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [ ] | `linteffect/no-mixed-pillar-function` | styleguide-four-pillars | strict | high | one function body mixes `Effect.gen`, large `.pipe()`, `flow()`, and `Layer.*` constructs |
| [ ] | `linteffect/no-clever-effect-expression` | styleguide-team-principles | strict | high | dense expression towers combining `pipe`, `flow`, `Effect.gen`, nested callbacks, and immediate invocation |
| [ ] | `linteffect/prefer-extracted-concept` | styleguide-team-principles | strict | high | anonymous callbacks or pipelines above a complexity threshold that should become named concepts |

## Slice Plan

### Slice 1: Strict Readability Heuristics

- [ ] `no-mixed-pillar-function`
- [ ] `no-clever-effect-expression`
- [ ] `prefer-extracted-concept`

## Detection Notes

Keep this group out of `recommended` initially. These rules encode team taste
and should mature through examples before public defaults.

Possible thresholds:

- `no-mixed-pillar-function`: three or more pillar markers in one function body
- `no-clever-effect-expression`: expression nesting depth above four with two or
  more Effect/flow/pipe markers
- `prefer-extracted-concept`: callback or inline pipeline above a configurable
  statement/expression count

## Safe Variants

Do not flag:

- top-level composition files where the explicit purpose is to wire pillars
  together
- tests and examples unless strict QA mode opts in
- small functions using one primary pillar plus one local value transform
