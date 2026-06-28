# 03 Resource Lifetime

Resource lifetime rules protect cleanup, shutdown behavior, and long-lived
service ownership. These are high-value runtime rules.

Primary reference:

- `EffectPatterns-main/packages/analysis-core/SCOPE_ANTI_PATTERNS.md`

## Rule Checklist

| Status | Proposed Rule | Reference ID | Default | Risk | Detection |
| --- | --- | --- | --- | --- | --- |
| [ ] | `linteffect/no-resource-without-acquire-release` | `resources-without-acquire-release` | runtime | medium | open/connect/create paired with close in Effect logic instead of acquireRelease |
| [ ] | `linteffect/no-resource-succeed-escape` | `returning-resources-instead-of-effects` | runtime | medium | `Effect.succeed(resourceLike)` where value name/type looks like connection/client/file |
| [ ] | `linteffect/no-unbound-scope` | `creating-scopes-without-binding` | recommended | low | `Scope.make()` without `Effect.scoped`, `Scope.close`, or scoped layer |
| [ ] | `linteffect/no-request-scoped-long-lived-resource` | `long-lived-resources-in-short-scopes` | strict | high | database/http clients acquired inside route/request handlers |
| [ ] | `linteffect/no-global-resource-singleton` | `global-singletons-instead-of-layers` | strict | medium | module-level `new Client/Pool/Connection/...` in Effect files |
| [ ] | `linteffect/no-manual-resource-close` | `closing-resources-manually` | recommended | low | `.close`, `.destroy`, `.dispose`, `.cleanup` inside Effect logic outside release callback |
| [ ] | `linteffect/no-run-with-open-resource` | `effect-run-with-open-resources` | runtime | high | `Effect.run*` called in scope with open resource creation |
| [ ] | `linteffect/no-nested-acquire-release` | `nested-resource-acquisition` | strict | low | nested `Effect.acquireRelease` depth greater than 2 |
| [ ] | `linteffect/no-scope-global` | `using-scope-global-for-convenience` | recommended | low | `Scope.global` in application logic |
| [ ] | `linteffect/no-missing-layer-provision-at-run` | `forgetting-to-provide-layers` | strict | high | `Effect.run*` on program that references service tags with no local provide call |

## Slice Plan

### Slice 1: Cleanup Safety

- [ ] `no-manual-resource-close`
- [ ] `no-unbound-scope`
- [ ] `no-scope-global`

### Slice 2: Acquisition Discipline

- [ ] `no-resource-without-acquire-release`
- [ ] `no-resource-succeed-escape`
- [ ] `no-nested-acquire-release`

### Slice 3: Runtime Boundaries

- [ ] `no-run-with-open-resource`
- [ ] `no-global-resource-singleton`
- [ ] `no-request-scoped-long-lived-resource`

### Slice 4: Layer Provision Research

- [ ] `no-missing-layer-provision-at-run`

## Resource-Like Names

Initial heuristics should match identifiers containing:

- `client`
- `connection`
- `conn`
- `pool`
- `db`
- `database`
- `file`
- `socket`
- `stream`
- `server`
- `subscription`
- `handle`

Keep this list centralized so resource rules share behavior.

