# Beyond Parity Roadmap

Last updated: 2026-11-16

## Current Status

The original actionable rule campaign and all 52 Effect 4 compatibility batches
are complete. Version 2.1.0 shipped the Effect.fn, explicit service-contract and
unbounded-concurrency policy corrections. The legacy consumer's platform advisory
was subsequently patched and GitHub marked it fixed; no package release was needed.

The completed [Concurrency Accuracy slice](02-concurrency-safety/README.md#concurrency-accuracy-follow-up) covers
race ownership, sequential versus parallel mutation, and binding-aware API
recognition in those three rules. It adds no rule IDs or presets. The slice is
complete locally: 611 tests, both complete packed consumers, packed type-aware
checks, docs/types/package checks and the unchanged size gate pass. See the
[completion report](../docs/superpowers/reports/2026-11-16-concurrency-accuracy.md).
Version scope: plugin 2.2.0 and later. Publication and hosted verification are
separate from this local evidence; see the [release notes](https://github.com/opsydyn/oxlint-effect/releases/tag/v2.2.0).

The active follow-up is [15 Selective Anti-Slop Adoption](15-anti-slop-adoption/README.md).
The overlap review covers cause-preserving error narrowing, ambient service
re-provision and test quality. Slice 1 adds cause-narrowing agent guidance and
executable review/repair pairs for both majors. Local verification passes: 615
tests, both complete packed consumers, type-aware and package checks. See its
[completion record](../docs/superpowers/reports/2026-11-16-anti-slop-cause-guidance.md).
The completed second slice adds `no-error-cause-loss` as an explicit errorModeling/ddd
policy, not a recommended default. It promotes the matched review corpus to
actual diagnostics and explicitly revises the measured runtime cap to 31 KB.
Local qualification passes: 632 tests, both complete packed-major suites and
the packed type-aware consumer. See the
[completion record](../docs/superpowers/reports/2026-11-16-opt-in-cause-loss.md).
Ambient service and general test detectors
remain separate candidates, not permission to port an entire policy.

This roadmap starts after Biome rule parity. The existing top-level `ROADMAP.md`
remains the parity record. This directory tracks new linting rules inspired by
`EffectPatterns-main`, `styleguide.md`, and Rust-inspired concurrency discipline,
grouped by the engineering outcome each group protects.

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
- Effect flow style: `styleguide.md`
- Rust-inspired concurrency: lock-across-suspension, shared-state ownership,
  cancellation, backpressure, and scoped resource lifetime discipline.

## Preset Strategy

The following is the original campaign strategy, not a list of exported preset
names. Use the current [README configuration](../README.md) for actual groups and
versioned exports; correctness and opt-in style policies must stay distinguishable.

- `recommended`: high-confidence, low-noise rules that catch correctness or
  production reliability issues.
- `strict`: stronger clean-code and DDD rules with heuristic false-positive
  risk.
- `ddd`: domain modeling and error modeling rules for teams that want explicit
  domain boundaries.
- `runtime`: concurrency, scope, resource, platform, and boundary rules.
- `observability`: logging, tracing, and deterministic-testability rules.
- `concurrencySafety`: every concurrency rule in this roadmap, including the
  Rust-inspired expansion, for teams that want one focused concurrency preset.
- `resourceLifetime`: cleanup, scope ownership, and resource escape rules for
  teams that want one focused resource lifecycle preset.
- `effectFlow`: workflow, behavior, and generator/pipe separation rules from
  `styleguide.md`.
- `pureTransformation`: `flow()` and pure data transformation rules.
- `behaviorDecoration`: retry, timeout, spans, logging, recovery, and DI
  placement rules.
- `styleSeparation`: strict readability rules for teams that want one obvious
  style per function.

## Roadmap Groups

| Group | Focus | Rule Count | First Slice |
| --- | --- | ---: | --- |
| [01 Correctness Core](./01-correctness-core/README.md) | Effect execution semantics and Promise/error escape hatches | 10 | yield-star, async callbacks, run boundaries |
| [02 Concurrency Safety](./02-concurrency-safety/README.md) | Fibers, parallelism, races, retry storms, mutable state, Rust-inspired ownership discipline | 18 | unbounded all, fire-and-forget fork, fork in loop |
| [03 Resource Lifetime](./03-resource-lifetime/README.md) | Scope, acquire/release, resource cleanup, app-level layers | 10 | manual close, unbound scope, resource escape |
| [04 Error Modeling](./04-error-modeling/README.md) | Tagged errors, preserving causes, typed error channels | 10 | generic error channel, string fail, generic rethrow |
| [05 Domain Modeling](./05-domain-modeling/README.md) | Brands, state machines, domain primitives, predicates | 10 | raw IDs, boolean flags, magic strings |
| [06 Service And Layer Architecture](./06-service-and-layer-architecture/README.md) | Effect.Service, Context.Tag migration, layer composition, dependency graph style | 12 | Context.Tag, Layer.provide in service, missing accessors |
| [07 Platform And Boundary Hygiene](./07-platform-and-boundary-hygiene/README.md) | Node/platform imports, JSON parsing, Date.now, app boundaries | 8 | node:fs, JSON.parse, Date.now |
| [08 Testing Observability And QA](./08-testing-observability-and-qa/README.md) | Tests, logging, spans, examples, release readiness | 8 | console in Effect, missing span, test layer shape |
| [09 Effect Flow](./09-effect-flow/README.md) | `Effect.gen` for workflow and `.pipe()` for behavior boundaries | 4 | piped yields, gen-for-mapping, workflow in pipe |
| [10 Pure Transformation](./10-pure-transformation/README.md) | `flow()` for named pure transformations and DTO/data pipelines | 4 | anonymous flow, effects in flow, nested pure call towers |
| [11 Behavior Decoration](./11-behavior-decoration/README.md) | Retry, timeout, spans, logging, recovery, and DI as decorators | 3 | static behavior calls, workflow in behavior pipes |
| [12 Style Separation](./12-style-separation/README.md) | One obvious style per function, strict readability heuristics | 3 | mixed pillars, clever expression towers |

Total candidate rules: 100.

The v1 completion slice implements every actionable candidate in these groups.
`no-scope-global` remains intentionally deferred because the supported
`effect@3.21.4` API does not expose `Scope.global`; it is excluded from the
plugin export and does not block the v1 release.

Some candidates intentionally overlap with EffectPatterns aliases. When
implementing, prefer one public `linteffect/*` rule name and document any
reference IDs as aliases.

## Version Compatibility

[14 Effect 4 First-Class Compatibility](./14-effect4-compatibility/README.md)
records the completed `2.0.0` transition: default presets target Effect 4,
with an explicit `effect3` namespace for legacy consumers. All 52 batches and
all 146 registered rules / 18 groups were qualified for that release. Current
packed consumers pin Effect 3.22.1 and 4.0.0; qualification against newer Effect 4
releases remains separate work, not implied by completion of the pinned matrix.
This migration does not add to the original candidate-rule count.

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
9. Effect Flow slice 1
10. Pure Transformation slice 1
11. Behavior Decoration slice 1
12. Concurrency Safety expansion slice 1
13. Style Separation slice 1

After those slices, decide whether to continue by group depth or by preset
completion. Bias toward high-confidence AST checks before semantic strict rules.
