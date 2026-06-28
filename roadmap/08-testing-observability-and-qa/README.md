# 08 Testing Observability And QA

Testing and observability rules make Effect programs easier to inspect, test,
and operate. These rules should start in `observability` or `strict`.

Primary references:

- `EffectPatterns-main/docs/SERVICE_PATTERNS.md`
- `EffectPatterns-main/content/published/patterns/testing/accessing-current-time-with-clock.mdx`
- `EffectPatterns-main/content/published/patterns/observability/trace-operations-with-spans.mdx`
- `examples/README.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [ ] | `linteffect/no-console-in-effect-flow` | `console-log-in-effect-flow` | recommended | low | `console.*` inside Effect code, prefer `Effect.log*` |
| [ ] | `linteffect/no-effect-log-without-structured-context` | logging discipline | strict | high | string-only `Effect.logError` in service/error handlers |
| [ ] | `linteffect/require-span-on-public-service-method` | trace operations with spans | strict | high | exported service methods returning Effect without `Effect.withSpan` |
| [ ] | `linteffect/no-test-mock-layer-when-default-available` | service test pattern | strict | high | test files providing manual mock layer for `Effect.Service` with `.Default` |
| [ ] | `linteffect/require-effect-flip-for-error-test` | service test pattern | strict | medium | `expect(...rejects...)` around Effect error tests instead of `Effect.flip` |
| [ ] | `linteffect/no-runpromise-in-non-async-test-body` | service test pattern | strict | medium | `Effect.runPromise` not awaited or returned in test files |
| [ ] | `linteffect/require-example-fixture-for-rule` | QA docs | strict | high | roadmap/docs rule added without example fixture annotation |
| [ ] | `linteffect/require-rule-doc-entry` | QA docs | strict | medium | exported rule missing README and roadmap entry |

## Slice Plan

### Slice 1: Runtime Observability

- [ ] `no-console-in-effect-flow`
- [ ] `no-effect-log-without-structured-context`
- [ ] `require-span-on-public-service-method`

### Slice 2: Test Shape

- [ ] `no-test-mock-layer-when-default-available`
- [ ] `require-effect-flip-for-error-test`
- [ ] `no-runpromise-in-non-async-test-body`

### Slice 3: Roadmap And Example QA

- [ ] `require-example-fixture-for-rule`
- [ ] `require-rule-doc-entry`

## QA Notes

Some QA rules are repo-self-linting rather than general Effect linting. Keep
them out of public `recommended` unless they are generalized.

Good first public rule: `no-console-in-effect-flow`.

Good first internal rule: `require-rule-doc-entry`.

