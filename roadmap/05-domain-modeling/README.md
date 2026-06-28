# 05 Domain Modeling

Domain modeling rules are design-smell detectors. They belong mostly in `ddd`
or `strict` because useful warnings may require project-specific tolerance.

Primary references:

- `EffectPatterns-main/packages/analysis-core/DOMAIN_MODELING_ANTI_PATTERNS.md`
- `EffectPatterns-main/content/published/patterns/domain-modeling/brand-model-domain-type.mdx`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [x] | `linteffect/no-raw-domain-primitive-params` | `primitives-for-domain-concepts` | ddd | high | domain-looking functions with multiple raw string/number params |
| [x] | `linteffect/no-boolean-domain-flag` | `boolean-flags-controlling-behavior` | ddd | medium | boolean params named `is*`, `has*`, `should*`, `with*`, `allow*` |
| [x] | `linteffect/no-magic-domain-string` | `magic-string-domains` | ddd | medium | string literal comparisons in domain conditionals |
| [x] | `linteffect/no-implicit-state-machine-object` | `objects-as-implicit-state-machines` | strict | high | objects/classes with multiple boolean state fields checked together |
| [x] | `linteffect/no-domain-logic-in-conditional` | `domain-logic-in-conditionals` | strict | high | complex boolean expressions mixing comparisons and domain names |
| [x] | `linteffect/no-adhoc-domain-error` | `adhoc-error-semantics-in-domain` | ddd | low | `Effect.fail("...")` / `throw new Error("...")` in domain paths |
| [x] | `linteffect/no-overloaded-options-object` | `overloaded-config-objects` | strict | high | `opts: any`, `config: any`, or large untyped option objects |
| [x] | `linteffect/no-raw-domain-id-alias` | `domain-ids-as-raw-strings` | ddd | low | `type UserId = string`, `type OrderId = number` |
| [x] | `linteffect/no-raw-time-domain-field` | `time-as-number-or-date` | ddd | medium | `expiresAt: number`, `timeoutMs: number`, raw `Date` in domain types |
| [x] | `linteffect/no-domain-meaning-by-folder-only` | `domain-meaning-from-file-structure` | strict | high | exported domain operations using raw IDs/context with admin/public path hints |

## Slice Plan

### Slice 1: Domain Primitives

- [x] `no-raw-domain-id-alias`
- [x] `no-boolean-domain-flag`
- [x] `no-magic-domain-string`

### Slice 2: Richer Domain Shapes

- [x] `no-raw-domain-primitive-params`
- [x] `no-raw-time-domain-field`
- [x] `no-overloaded-options-object`

### Slice 3: Business Logic Visibility

- [x] `no-domain-logic-in-conditional`
- [x] `no-implicit-state-machine-object`
- [x] `no-adhoc-domain-error`

### Slice 4: Context Encoding

- [x] `no-domain-meaning-by-folder-only`

## False-Positive Control

These rules should support config options before moving into `recommended`:

- ignored path globs
- ignored parameter names
- minimum primitive parameter count
- domain path hints such as `domain`, `model`, `entity`, `aggregate`, `service`
- allowed literal strings for protocol/framework values
