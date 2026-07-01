# Beyond Parity Roadmap

Last updated: 2026-07-01

This roadmap starts after Biome rule parity. The existing top-level `ROADMAP.md`
remains the parity record. This directory tracks new linting rules inspired by
`EffectPatterns-main`, grouped by the engineering outcome each group protects.

## Goals

- Move from syntax parity to idiomatic Effect guidance.
- Prioritize rules that catch correctness, lifecycle, concurrency, and modeling
  defects before style preferences.
- Keep each rule AST-detectable first. Type-aware or project-wide ideas should
  start as strict review rules or deferred research.
- Ship in batches of three rules where practical, with direct unit tests,
  config coverage, Oxlint integration fixtures, examples, docs, and pack checks.

## Source Material

- Correctness: `EffectPatterns-main/packages/analysis-core/TOP_10_CORRECTNESS_ANTI_PATTERNS.md`
- Concurrency: `EffectPatterns-main/packages/analysis-core/CONCURRENCY_ANTI_PATTERNS.md`
- Resource lifetime: `EffectPatterns-main/packages/analysis-core/SCOPE_ANTI_PATTERNS.md`
- Error modeling: `EffectPatterns-main/packages/analysis-core/ERROR_MODELING_ANTI_PATTERNS.md`
- Domain modeling: `EffectPatterns-main/packages/analysis-core/DOMAIN_MODELING_ANTI_PATTERNS.md`
- Service architecture: `EffectPatterns-main/docs/SERVICE_PATTERNS.md`
- Testing clock guidance: `EffectPatterns-main/content/published/patterns/testing/accessing-current-time-with-clock.mdx`

## Preset Strategy

- `recommended`: high-confidence, low-noise rules that catch correctness or
  production reliability issues.
- `strict`: stronger clean-code and DDD rules with heuristic false-positive
  risk.
- `ddd`: domain modeling and error modeling rules for teams that want explicit
  domain boundaries.
- `runtime`: concurrency, scope, resource, platform, and boundary rules.
- `observability`: logging, tracing, and deterministic-testability rules.

## Roadmap Groups

| Group | Focus | Rule Count | First Slice |
| --- | --- | ---: | --- |
| [01 Correctness Core](./01-correctness-core/README.md) | Effect execution semantics and Promise/error escape hatches | 10 | yield-star, async callbacks, run boundaries |
| [02 Concurrency Safety](./02-concurrency-safety/README.md) | Fibers, parallelism, races, retry storms, mutable state | 10 | unbounded all, fire-and-forget fork, fork in loop |
| [03 Resource Lifetime](./03-resource-lifetime/README.md) | Scope, acquire/release, resource cleanup, app-level layers | 10 | manual close, unbound scope, Scope.global |
| [04 Error Modeling](./04-error-modeling/README.md) | Tagged errors, preserving causes, typed error channels | 10 | generic error channel, string fail, generic rethrow |
| [05 Domain Modeling](./05-domain-modeling/README.md) | Brands, state machines, domain primitives, predicates | 10 | raw IDs, boolean flags, magic strings |
| [06 Service And Layer Architecture](./06-service-and-layer-architecture/README.md) | Effect.Service, Context.Tag migration, layer composition | 8 | Context.Tag, Layer.provide in service, missing accessors |
| [07 Platform And Boundary Hygiene](./07-platform-and-boundary-hygiene/README.md) | Node/platform imports, JSON parsing, Date.now, app boundaries | 8 | node:fs, JSON.parse, Date.now |
| [08 Testing Observability And QA](./08-testing-observability-and-qa/README.md) | Tests, logging, spans, examples, release readiness | 8 | console in Effect, missing span, test layer shape |

Total candidate rules: 74.

Some candidates intentionally overlap with EffectPatterns aliases. When
implementing, prefer one public `linteffect/*` rule name and document any
reference IDs as aliases.

## Update Protocol

Only mark a rule complete after:

```bash
bun run test
bun run typecheck
bun run build
bun run lint
bun run docs:api:check
bun run size
bun run pack:dry-run
```

For each completed rule:

- [ ] Add direct unit coverage in `tests/plugin.test.ts`
- [ ] Add config coverage in `tests/config.test.ts`
- [ ] Add Oxlint CLI fixture coverage in `tests/oxlint.integration.test.ts`
- [ ] Add invalid and valid fixture coverage under `tests/fixtures/oxlint`
- [ ] Add example anti-pattern coverage under `examples`
- [ ] Export the rule from `src/index.ts`
- [ ] Add the rule to `README.md`
- [ ] Update the relevant group roadmap checkbox
- [ ] Add a changeset when releasing

## Suggested Implementation Order

1. Correctness Core slice 1
2. Concurrency Safety slice 1
3. Resource Lifetime slice 1
4. Error Modeling slice 1
5. Domain Modeling slice 1
6. Service And Layer Architecture slice 1
7. Platform And Boundary Hygiene slice 1
8. Testing Observability And QA slice 1

After those eight slices, decide whether to continue by group depth or by preset
completion.
