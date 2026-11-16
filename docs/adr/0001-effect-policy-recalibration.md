# ADR 0001: Separate Effect Style From Default Policy

## Status

Accepted, 2026-11-16, for the approved three-item recalibration slice.

## Context

The 2.0.1 recommended presets reject generator-based Effect.fn and explicit
Effect/Layer annotations, although these are supported tools for tracing and
service contracts. Collection rules diagnose missing scheduling options rather
than explicit unbounded work. Omitted concurrency is sequential in both pinned
Effect majors. Existing qualification tests encode those historical policies.

## Decision

Exclude no-effect-fn-generator, no-manual-effect-channels and no-effect-type-alias
from recommended/recommendedRules and inherited typeAware presets for both majors.
Keep their rule IDs, explicit effectComposition group membership and allRules
entries for teams that deliberately select the stricter style. Diagnostic advice
must identify these as opt-in style restrictions, not invalid Effect APIs.
Supporting Effect.fn also requires the existing throw, try/catch and Promise
checks to inspect its generator body. Add that shared owner path without scanning
unexecuted nested functions; keep valid named operations and explicit contracts clean.

no-unbounded-effect-all diagnoses visible literal unbounded concurrency on
Effect.all, including stored or tuple inputs. no-unbounded-concurrent-retry uses
the same value-aware policy for all/forEach. Omitted options are clean. Inspect
properties in effective order; later opaque spreads/computed keys remain unknown.
Named budgets and arbitrary expressions are not statically proved safe or unsafe.

## Consequences And Trade-offs

Existing recommended users receive fewer style diagnostics and new diagnostics
for explicit unbounded fan-out. This is a documented minor lint-policy update;
no exported rule is removed. Explicit group/all-rule users retain the bans and
must disable them to admit traced generators or explicit contracts. This is not
a complete correctness-only redesign of recommended.

The detectors remain syntax-local. They do not prove a runtime concurrency bound,
resolve opaque configuration, or identify external semaphore ownership. A finite
budget does not bound retries or guarantee eventual success.

## Options Considered

- Delete the three rules: rejected because explicit consumers retain that policy.
- Add a new preset and more rule IDs: unnecessary for this bounded correction.
- Preserve option-presence checks: rejected because safe sequential work warns
  while an explicit unbounded budget passes.
- Infer budgets across modules: deferred to the separate binding/semantic work.

## Acceptance And Recovery

Require RED/GREEN preset and real Oxlint regressions, both packed consumer
matrices, typed service and automatic-span runtime contracts, annotated bad/clean
concurrency cases, preserved ordered values and failure identities, bounded and
sequential runtime budgets, and the unchanged 30 KB package cap.

No dependency upgrades, Bun-native qualification, unrelated rule redesign,
publication or push belong to this change. Recovery is an explicitly reviewed
policy revert; the retained IDs also permit consumers to restore prior opt-ins.

## Sources

- [Effect.fn](https://effect.website/docs/v4/api/effect/Effect#fn)
- [Service contracts](https://effect.website/docs/v4/requirements-management/services)
- [Concurrency defaults](https://effect.website/docs/v4/concurrency/basic-concurrency)

## Follow-up

The remaining assessment findings, latest Effect qualification and anti-slop
adoptions remain separate work, not completed by this ADR.
