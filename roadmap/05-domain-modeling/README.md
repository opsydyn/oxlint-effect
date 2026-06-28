# 05 Domain Modeling

Domain modeling rules are design-smell detectors. They belong mostly in `ddd`
or `strict` because useful warnings may require project-specific tolerance.

Primary references:

- `EffectPatterns-main/packages/analysis-core/DOMAIN_MODELING_ANTI_PATTERNS.md`
- `EffectPatterns-main/content/published/patterns/domain-modeling/brand-model-domain-type.mdx`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [ ] | `linteffect/no-raw-domain-primitive-params` | `primitives-for-domain-concepts` | ddd | high | domain-looking functions with multiple raw string/number params |
| [x] | `linteffect/no-boolean-domain-flag` | `boolean-flags-controlling-behavior` | ddd | medium | boolean params named `is*`, `has*`, `should*`, `with*`, `allow*` |
| [x] | `linteffect/no-magic-domain-string` | `magic-string-domains` | ddd | medium | string literal comparisons in domain conditionals |
| [ ] | `linteffect/no-implicit-state-machine-object` | `objects-as-implicit-state-machines` | strict | high | objects/classes with multiple boolean state fields checked together |
| [ ] | `linteffect/no-domain-logic-in-conditional` | `domain-logic-in-conditionals` | strict | high | complex boolean expressions mixing comparisons and domain names |
| [ ] | `linteffect/no-adhoc-domain-error` | `adhoc-error-semantics-in-domain` | ddd | low | `Effect.fail("...")` / `throw new Error("...")` in domain paths |
| [ ] | `linteffect/no-overloaded-options-object` | `overloaded-config-objects` | strict | high | `opts: any`, `config: any`, or large untyped option objects |
| [x] | `linteffect/no-raw-domain-id-alias` | `domain-ids-as-raw-strings` | ddd | low | `type UserId = string`, `type OrderId = number` |
| [ ] | `linteffect/no-raw-time-domain-field` | `time-as-number-or-date` | ddd | medium | `expiresAt: number`, `timeoutMs: number`, raw `Date` in domain types |
| [ ] | `linteffect/no-domain-meaning-by-folder-only` | `domain-meaning-from-file-structure` | strict | high | exported domain operations using raw IDs/context with admin/public path hints |

## Slice Plan

### Slice 1: Domain Primitives

- [x] `no-raw-domain-id-alias`
- [x] `no-boolean-domain-flag`
- [x] `no-magic-domain-string`

### Slice 2: Richer Domain Shapes

- [ ] `no-raw-domain-primitive-params`
- [ ] `no-raw-time-domain-field`
- [ ] `no-overloaded-options-object`

### Slice 3: Business Logic Visibility

- [ ] `no-domain-logic-in-conditional`
- [ ] `no-implicit-state-machine-object`
- [ ] `no-adhoc-domain-error`

### Slice 4: Context Encoding

- [ ] `no-domain-meaning-by-folder-only`

## False-Positive Control

These rules should support config options before moving into `recommended`:

- ignored path globs
- ignored parameter names
- minimum primitive parameter count
- domain path hints such as `domain`, `model`, `entity`, `aggregate`, `service`
- allowed literal strings for protocol/framework values
