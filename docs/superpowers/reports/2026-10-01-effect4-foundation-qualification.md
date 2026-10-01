# Effect Version Foundation Qualification

Date: 2026-10-01. Scope: approved foundation plan only, not full v4 adaptation.

## Delivered

- Default-v4 configuration maps and complete `effect3` legacy namespace.
- Validated sensitive-rule version schemas, preserving existing path options.
- Audit entries for all 146 registered rules; runtime policy projection agrees
  with the documentation inventory.
- Independent pinned Effect 3.21.4 and 4.0.0 packed consumers.
- Exact JSON diagnostic counts, clean controls and packed config declarations.
- Mixed-major overrides with cross-policy path controls, checked per file in
  one Oxlint process; no claim of semantic version selection in pending detectors.
- CI matrix for both consumers; existing build and type-aware jobs preserved.
- Release/prepublish guard requiring a reviewed major version and qualification
  of every applicable rule for both majors.

Commits: `432419b` (options/inventory), `a316b93` (configuration namespace),
`d21775f` (packed consumers), `a36d9ea` (CI/release gate). The subsequent
review-fix commit contains this report and the hardened diagnostic controls.

## Evidence

| Gate | Local Result |
| --- | --- |
| `bun run test` after review fixes | 455 pass, 0 fail |
| `bun run typecheck` after review fixes | Pass |
| `bun run test:effect-versions` after review fixes | Both pinned majors pass |
| `bun run test:type-aware` | Pass, existing legacy consumer |
| `bun run build` | Pass |
| `bun run lint` | Publint passes |
| `bun run docs:api:check` | Pass |
| `bun run size` | 26.26 kB brotlied, below 27 kB |
| `bun run pack:dry-run` | Pass |
| `git diff --check` | Pass |
| Relative links in updated project docs | Pass |
| Release-readiness script on package 1.2.0 | Expected rejection; no publication attempted |

Qualification inventory: v4 has 1 scoped rule qualified, 140 pending and 5
not-applicable; v3 has 1 scoped rule qualified and 145 baseline entries.
The probe covers direct `Effect.fail(sourceError.message)` diagnostics and clean
typed-error/success controls, not every rule variant or all DDD repairs.

The GitHub matrix was added, not executed remotely. No push, npm publication,
Linux CI acceptance or credential change occurred.

## Review And Fixes

One fresh read-only reviewer found two Important QA issues. Both entered a
single RED/GREEN fix pass:

1. Rendered rule labels in source/message text inflated counts. A failing test
   observed 2 instead of 1. JSON diagnostic-record parsing now returns 1 and
   rejects malformed output rather than treating it as clean.
2. Original mixed-major controls could not distinguish isolated exemptions
   from globally merged boundary lists. New cross-policy paths require two
   additional warnings in specific files; per-file comparison rejects a
   globally merged exemption result and wrongly redistributed counts. The
   helper's new regression failed before implementation; both real packed
   consumer runs pass the resulting eight-file, four-diagnostic control.

No deferred minor findings were reported. Semantic detector adaptation,
publication and remote host qualification remain intentionally outside this
foundation's completion claim.

## Rulings And Costs

1. Keep a compact runtime policy projection instead of bundling inventory prose.
   Cost: projection drift is possible; exact inventory tests guard it.
2. Use `no-early-catchall-null` for existing-path schema validation because the
   runner rule has no boundary exemption today. Cost: runner boundary repair
   remains a next-batch obligation, not a claimed legacy feature.
3. Classify five stable-v4-absent targets/options as v3-only, not just the two
   service requirements. Cost: their IDs disappear from default maps while
   remaining registered and present in `effect3`.
4. Generated rule tuples are mutable to satisfy actual Oxlint `defineConfig`
   types. Cost: callers can mutate values; treat presets as config inputs.
5. Add local release/prepublish blocking without changing the release workflow.
   Cost: release attempts intentionally fail until major-version and
   qualification prerequisites are met.
6. Pending v4 semantics/messages belong to adaptation batches. Cost: default
   policy maps are not a claim that all default diagnostics work in v4.
7. Major-selection isolation during detection is not yet qualified. Cost: each
   adaptation batch must add semantic mixed-major controls when it consumes
   `effectVersion`; current boundary tests prove path/config isolation only.
8. Do not infer publication or Linux acceptance from local checks. Cost:
   registry and host-specific problems may still appear on an authorised run.

## Next Work

Plan the three-rule [recovery/runtime batch](../../../roadmap/14-effect4-compatibility/recovery-runtime-batch.md):
`no-catchall-generic-rethrow`, `no-early-catchall-null`,
`no-run-effect-outside-boundary`, with transitive helper regression coverage,
major-correct anti-patterns, clean controls and failure-preservation contracts.
