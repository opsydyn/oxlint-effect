# Next Batch: Recovery And Runtime Boundaries

Status: implemented and locally qualified on 2026-10-01. See the
[implementation plan](../../docs/superpowers/plans/2026-10-01-effect4-recovery-runtime.md)
and [qualification report](../../docs/superpowers/reports/2026-10-01-effect4-recovery-runtime-qualification.md).
This batch starts from the compatibility foundation; wider recovery qualification remains open.

## Three Headline Rules

| Rule | Effect 3 | Effect 4 | Required Clean Control |
| --- | --- | --- | --- |
| `no-catchall-generic-rethrow` | `catchAll` generic rethrow | `catch` generic rethrow | Preserve the original structured error or explicitly map to a tagged error |
| `no-early-catchall-null` | `catchAll` null/undefined/default fallback | `catch` equivalent fallback | Propagate failure, or recover at a configured/default boundary |
| `no-run-effect-outside-boundary` | Six existing `run*` methods | Existing methods plus six `run*With` methods | Return an Effect from domain logic; execute at a recognised boundary |

Keep rule IDs stable. Select operator/runner recognition using the per-file
`effectVersion` option. Preserve Effect 3 messages and policy under `effect3`.
Do not flag a legacy spelling under v4 merely as a migration diagnostic.

## Shared Helpers And Regression Owners

- `catchAllGenericRethrow`, `earlyCatchAllFallback`, `catchAllOperators` and
  `errorHandlerCallbacks`: recovery matching must cover direct calls, piped
  operators, expression callbacks and block returns. Do not collapse distinct
  Cause, defect, filtered or reason-based recovery contracts into plain catch.
- `effectRunMethods` and `isEffectRunCall`: shared by `no-hidden-effect-execution`,
  `no-boundary-try-catch-without-effect-map`, `no-run-with-open-resource` and
  `no-missing-layer-provision-at-run`. Keep their v3 fixtures green and add v4
  regression controls for each affected runner use.
- Other recovery sets remain audit owners: `effectAsyncCallbackCombinators`,
  `errorHandlingOperators`, `modeledErrorOperators`, `behaviorDecorationOperators`,
  `findEffectCatchAll` and boundary recovery methods. Check transitive consumers
  listed in `docs/effect-version-inventory.json`; changes to a shared table must
  not implicitly qualify all of them.
- Test-shape runner detectors use their own `runPromise` recognition. Record
  new `runPromiseWith` coverage as a follow-on requirement unless the batch
  changes those paths; do not silently mark the testing group complete.

## Required Variants And Counts

For each major, add isolated configurations selecting one headline rule at a
time and assert literal diagnostic arrays/counts, not the rule-ID set alone:

1. Generic rethrow: one expression callback and one block-return callback;
   exactly two diagnostics. Original/tagged errors and unrelated callbacks
   produce none. Include direct and piped forms across these pairs.
2. Early fallback: one each for null, undefined and a named fallback;
   exactly three diagnostics in domain files. Matching default/custom boundary
   files produce none. Demonstrate an override replacing paths while retaining
   `effectVersion: 3` explicitly.
3. Runner boundaries: one execution for each existing method (six diagnostics
   outside boundaries in each major); one execution for each v4 `run*With`
   method (six further diagnostics for v4). Context factory creation alone is
   not execution; prove curried application is counted once, not twice.

Stable 4.0.0 exports identify `runCallbackWith`, `runForkWith`, `runPromiseWith`,
`runPromiseExitWith`, `runSyncWith` and `runSyncExitWith`. Typecheck actual factory
and execution signatures against the pinned package before encoding triggers.
Use actual required context values, not casts hiding invalid examples.

The pre-batch runner rule had no configurable boundary exemption despite its
diagnostic wording. It now uses the shared conservative defaults/schema and
supports replacement/empty boundary paths for both majors. This is an intentional
contract correction, not a claim that legacy releases already exempted boundaries.

Qualified With detection covers immediate curried execution, not stored runner
aliases, renamed imports or computed properties. Shared consumers have runner
regressions but are not fully qualified. Context-supplied runners do not trigger
missing Layer provision: environment completeness cannot be proven from syntax.

## Completion Gate

Ship annotated anti-patterns and clean controls for both majors in the packed
consumers and reference examples. Assert runtime failure preservation where
recovery semantics are involved. Update rule descriptions, major-specific
repair advice, inventory evidence and roadmap status with the tests.

Run the normal repository gates, both packed majors and type-aware consumer QA.
Commit the verified batch; no release until all applicable groups qualify.
