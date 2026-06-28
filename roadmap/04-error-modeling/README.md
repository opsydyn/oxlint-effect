# 04 Error Modeling

Error modeling rules push code toward tagged, structured, recoverable error
channels. These rules are central to DDD and observability.

Primary references:

- `EffectPatterns-main/packages/analysis-core/ERROR_MODELING_ANTI_PATTERNS.md`
- `EffectPatterns-main/content/published/patterns/domain-modeling/define-tagged-errors.mdx`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [ ] | `linteffect/no-error-as-public-effect-error` | `error-as-public-type` | ddd | medium | exported `Effect.Effect<_, Error>` return types |
| [ ] | `linteffect/no-mixed-effect-error-shapes` | `mixed-error-shapes` | ddd | medium | error channel union mixing `Error`, string, number, boolean, unknown |
| [ ] | `linteffect/no-effect-fail-error-message` | `convert-errors-to-strings-early` | recommended | low | `Effect.fail(error.message)` or string concatenation from error |
| [ ] | `linteffect/no-catchall-generic-rethrow` | `catch-and-rethrow-generic` | recommended | low | `catchAll(() => Effect.fail(new Error(...)))` |
| [ ] | `linteffect/no-early-catchall-null` | `catching-errors-too-early` | strict | medium | non-boundary `catchAll(() => Effect.succeed(null/undefined/fallback))` |
| [ ] | `linteffect/no-expected-state-as-error` | `expected-states-as-errors` | ddd | medium | `Effect.fail("NotFound" | "Missing" | "Empty" | "None")` |
| [ ] | `linteffect/no-exception-domain-error` | `exceptions-for-domain-errors` | recommended | low | `throw new *Error` inside Effect domain logic |
| [ ] | `linteffect/no-empty-error-tag` | `error-tags-without-payloads` | strict | low | `_tag`-only error type or `Data.TaggedError` with empty payload |
| [ ] | `linteffect/no-unknown-public-error-channel` | `overusing-unknown-error-channel` | ddd | medium | exported `Effect.Effect<_, unknown>` return types |
| [ ] | `linteffect/no-log-only-error-handling` | `logging-instead-of-modeling-errors` | strict | medium | `tapError` or `catchAll` that logs but does not map/re-fail/model |

## Slice Plan

### Slice 1: Public Error Contracts

- [ ] `no-error-as-public-effect-error`
- [ ] `no-unknown-public-error-channel`
- [ ] `no-mixed-effect-error-shapes`

### Slice 2: Preserve Error Structure

- [ ] `no-effect-fail-error-message`
- [ ] `no-catchall-generic-rethrow`
- [ ] `no-log-only-error-handling`

### Slice 3: Domain Error Semantics

- [ ] `no-early-catchall-null`
- [ ] `no-expected-state-as-error`
- [ ] `no-exception-domain-error`

### Slice 4: Tagged Error Quality

- [ ] `no-empty-error-tag`

## DDD Guidance

Prefer these targets in rule messages:

- `Data.TaggedError`
- `Data.TaggedEnum`
- `Effect.catchTag`
- structured `cause`
- operation-specific context fields

Avoid requiring one naming convention for every team. The lint message should
push toward explicit shape and recovery, not exact class names.

