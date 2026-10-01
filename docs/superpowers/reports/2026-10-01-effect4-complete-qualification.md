# Wider Effect Qualification Progress

Status: in progress; not a compatibility-completion or publication claim.
Baseline: b159eb8. Approved inline execution on main; no push or publish.

## Harness

- Case manifests validate registered rule, major, classification, nonempty
  variants, bad/clean sources and positive literal per-file warning counts.
- Unsafe, missing and external-symlink source paths fail qualification.
- Qualified inventory entries without cases fail the partial gate.
- The complete gate rejects the baseline inventory before installation.
- Four existing scoped rule qualifications migrated to isolated packed cases
  for both Effect 3.21.4 and 4.0.0, retaining prior mixed-policy/path probes.
- RED missing validation/CLI interfaces, then GREEN: 12 focused tests.
- Task 1 gates: 466 tests pass; root typecheck, both packed majors and separate
  packed type-aware consumer pass. No detector changes in this task.

## Batch Evidence

Q01: public error contracts qualified unchanged for both majors. Each rule has
five parsed warnings (named/default functions, arrow, typed callable, function
expression) and clean tagged unions/private/non-Effect controls. Tagged repairs
retain tag/userId at runtime and support catchTag recovery; a checked negative
type fixture rejects generic Error in the tagged public contract. No detector
change was necessary. Evidence is in each consumer's errorModeling group and
qualification manifest; synthetic report nodes are asserted too.

Q02: expected-state and empty-tag syntax qualified in both majors; the v4
expected-state repair now names Result rather than the removed Either API.
Domain exceptions cover 3 parsed legacy and 14 v4 callback forms, including
handler maps; unused nested functions stay clean in v4. Typed runtime controls
retain absence/presence, state payloads and original error causes. All 470 tests,
root types and both packed majors pass; build is 26.82 KB brotlied (27 KB cap).

The plan's Q01-Q52 table is the progress checklist. Wider groups remain open.

Q03: log-only recovery has 3 parsed legacy and 14 v4 warnings; v4 recovery
families and maps warn while failure-preserving observers stay clean. Runtime
contracts retain typed error identity and distinguish defects from failures.
Earlier plain recovery rules now cover catchEager in their packed v4 probes.
472 tests, both packed majors and root types pass; size remains under 27 KB.

Q04: as/Do/bind remain unchanged APIs in both majors. Two parsed warnings per
rule/major, unrelated receivers and typechecked map/gen repairs pass; runtime
controls preserve mapped values and bound object shapes. 473 tests, root types,
both packed majors and size 26.8 KB pass. No detector changes.

Q05: async stays legacy-only, including explicit v4 manual-policy no-op and a
compiler-negative removed-API contract. Two legacy async warnings and adapter
repair, two ignore and never warnings per major and finite scoped teardown
controls pass. 474 tests, root types, both packed majors and size 26.84 KB pass.

Q06: v4 named fn/self-bound gen and own-workflow boundaries qualified, retaining
legacy first-generator behaviour. V4 runtime proves plain yield executes;
diagnostic now accurately explains delegation typing/style. Flat/delegated
repairs preserve results. 475 tests, root types, both packed majors and size
26.98 KB pass. Shared helper owners not explicitly versioned remain pending.

Q07: callback ownership uses the audited version-selected recovery table.
Async cases have 10 legacy/19 v4 parsed warnings; throwing/try-catch cases have
3 legacy/15 v4 warnings each, with typed payload/cause repairs. Checked-negative
callback contracts distinguish valid legacy Promise overloads from v4's stricter
Effect callbacks. The Q02 self-bound generator gap has its own RED/GREEN and
packed regression. 477 tests, root types, both packed majors and 26.97 KB pass.

Q08: 13 legacy/25 v4 Promise cases, 4 legacy/16 v4 swallowed-recovery cases
and two channel-type cases per major pass. V4 visible Promise sources exclude
Effect.catch and unrelated receivers; stored aliases are outside this syntactic
scope. asVoid of re-failure stays clean and retains original failure identity.
Shared visitors and scope walkers have full prior-owner regression coverage.
478 tests, root types, both packed majors and the unchanged 27 KB size gate pass.

Q09: two alias forms and five explicit public export forms per major warn;
inferred/interface contracts and structured error repairs stay clean. Runtime
values and tagged payloads retained. 479 tests, root types, both packed majors
and the 27 KB size gate pass. No detector change needed.

## Rulings

Q10 is qualified: all 14 legacy and 25 v4 decoration spellings
have parsed bad/clean controls; repeated yields and buried-workflow thresholds,
value preservation and recovery identity contracts pass in both packed majors.
480 tests and root types pass. The build initially failed the 27 KB cap; the
user explicitly approved a 30 KB dual-major budget on 2026-10-01. Fresh tests,
types, both packed majors, build, size (27.16 KB) and diff checks pass under that
approved bound. The three inventory entries and allocation checkbox now record
qualification. No push or publication has occurred; subsequent batches remain open.

The decorated-yield walker now uses existing findNodes with opt-in stop-at-match
and own-function-scope controls; defaults preserve prior owners. The three
decoration visitors share the existing versioned callback-rule factory.
Regression tests and both packed corpora pass; this does not qualify other
style-pillar consumers of shared decoration recognition.

## Q11 Style Separation

Version-selected pillar classification now recognises v4 recovery and eager
sequencing, while preserving legacy catchAll/zipRight policy. RED exposed the
missing v4 recovery pillar; GREEN asserts function/call report locations and
removed spelling isolation. The unchanged extraction heuristic is qualified
without narrowing its existing import-gated ordinary-JS callback scope.

Packed cases warn four legacy/five v4 mixed functions, three clever expressions
and four oversized callbacks per major. Controls cover named composition,
Layer construction, IIFE wrappers, threshold boundaries and deep single pillars.
All repairs typecheck and preserve result values. Shared workflow-helper owners
retain their default legacy recognition until their allocated audit; no blanket
qualification is inferred. Q12-Q52 and cross-group closure remain outstanding.
Fresh gates: 481 tests, root typecheck, both packed majors, build, 27.2 KB under
the approved 30 KB limit and diff check pass.

## Q12 Service Definitions

RED tests exposed v4 advice still recommending removed Effect.Service and
missing Context.Service make construction detection. Version-selected advice
and construction visitors now pass report-location checks. Legacy accessor
enforcement has an explicit v4 no-op, verified through a packed manual config.

The packed corpus reports two legacy Tag/GenericTag migrations, three removed
v4 calls checked with compiler-negative contracts, two legacy inline wiring
builders and three v4 make builders (class, function and class expression).
Legacy omitted/disabled accessors report twice; generated accessor repairs work.
Both majors' supported repairs preserve service value 42 and contextual layer
retrieval. Removed v4 calls are not executed or cast into fictional APIs.

Ruling: valid bare Context.Service keys remain clean; make is optional in the
installed API, not a new requirement. The historical preference rule is a v4
migration diagnostic. Inline make layer-assembly policy retains the existing
construction/composition separation, without banning legitimate Layer.provide
at external boundaries or on shape-level values. Named builder aliases remain
outside local syntax recognition. Other shared-helper owners are not qualified
by this batch; Q13-Q52 and cross-group closure remain open.
Fresh gates: 483 tests, root typecheck, both packed majors (including manual
v4 accessor exclusion), build, size 27.38 KB under 30 KB and diff check pass.

## Q08 Decisions

Limit v4 chain detection to syntactically visible Promise sources: without type
information, a method called catch/then/finally does not establish a Promise.
Legacy broad chain recognition remains unchanged. This trades unresolved stored
aliases for avoiding v4 Effect.catch and unrelated-object false positives.

Only visibly successful asVoid recovery is classified as swallowed in v4;
asVoid itself preserves errors. Unknown effect arguments remain outside this
local success proof. Legacy asVoid reporting remains unchanged.

The near-cap build required consolidating the identical import/version/report
visitors for the callback owners changed in Q02/Q03/Q07/Q08. Diagnostic text is
factored without changing legacy text, and duplicate catchTag set membership is
removed. No size limit was raised; all existing packed cases still pass.

The Q07 build exceeded 27 KB. Deduplicating the changed scope/yield/exception
walkers through the existing cycle-safe findNode reduced it below the unchanged
cap. Legacy traversal and all prior qualified callback controls are retained.

V4 log-only policy excludes observers because the installed API preserves the
original failure; legacy tapError reporting is retained for compatibility.
This is a deliberate major-version policy distinction. Existing syntax-local
limits remain in force; this is not interprocedural recovery verification.
