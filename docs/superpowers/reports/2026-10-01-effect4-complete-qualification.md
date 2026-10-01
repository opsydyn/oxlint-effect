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

## Q13 Dependencies And Exports

Q13: dependency checks are legacy-only and explicitly inactive under manual
v4 policy. RED reproduced a v4 legacy dependency warning and missing packed
evidence; GREEN confirms report targets and isolated major policy. Import and
manual-export detectors needed no changes. The packed corpus reports two v3
effect/scoped dependency cases, three root/subpath namespace imports and four
manual literal service exports per major. Controls include named/local imports,
data-only/differently named/private/aliased objects and actual version-correct
services. Runtime repairs preserve value 42, including explicit v4 make-layer
dependency provision. Compiler-negative controls reject removed v4 options;
the parsed legacy probe is never executed. Empty dependency arrays pass the
existing option-presence policy and still require contextual provision.

Ruling: preserve existing suffix/literal/declaration-presence heuristics rather
than introduce inferred dependency graphs or broaden export resolution during
compatibility work. Pure function members in matching literals can warn;
separately exported aliases are not resolved. These limits are now documented
and exercised by typed/runtime controls. Fresh 485 tests, root typecheck,
both packed majors, build, 27.39 KB under 30 KB and diff check pass.
Q14-Q52 and cross-group closure remain open.

## Q14 Handler Layers And Service Methods

RED exposed missing Context.Service method recognition and the named Effect.fn
make factory gap. GREEN inspects literal constructed service shapes and actual
method returns rather than Promise adapter callbacks. V4 annotation, async,
visible static/chain/constructor and own-scope block returns are recognised;
Effect adapters and unused local callbacks stay clean. Legacy traversal is
unchanged. Packed cases report three legacy/six v4 methods, three request-handler
declarations and three nested-input provide calls per major.

Typed/runtime controls retain successful value 42, original tagged failure
identity, actual Source/Middle/Output provisioning order and contextual method
retrieval. Named construction aliases and opaque builders are not inferred;
request names/arrow controls and provider-argument nesting retain existing
heuristic scope. Fresh 487 tests, root typecheck, both packed majors, build,
size 27.6 KB under 30 KB and diff check pass. Q15-Q52 and group closure remain open.

Ruling: inspect recognised constructed shapes in v4, not all nested properties
of make, to avoid diagnosing Effect.tryPromise's callback options as public
Promise methods. Unknown named builders and Promise aliases remain outside the
syntax proof. This trades missed opaque construction for avoiding false
positives in legitimate adapters; legacy behaviour is preserved.

## Q15 Infrastructure Composition

RED exposed missing v4 self-bound generator recognition and missing packed
evidence. GREEN recognises ordinary/self-bound Effect.gen and generator
Effect.fn, including named forms, while restricting v4 traversal to the
generator's own scope. Legacy gen traversal is unchanged. Packed cases report
three inline provisions for v3/five for v4, three nested merge warnings and
two scatter warnings per major; focused tests verify report nodes and fresh
per-context scatter counters.

Typed/runtime repairs preserve actual dependency order and workflow value 42,
all four independent merged service values and each scattered service/program
result. Single merges, two matching declarations, differently named provision
and unused v4 nested helpers remain clean. Fresh 489 tests, root types, both
packed majors, build, size 27.59 KB under 30 KB and diff check pass. Q16-Q52 and
cross-group closure remain open; 100 rules retain an unqualified version.

Ruling: v4 generator Effect.fn has the same workflow ownership as Effect.gen;
unused nested functions are not part of that workflow. This can miss provision
hidden behind named helpers, which remains outside syntax-only proof. Merge
and scatter policy stays unchanged: only independent merges are repaired,
and scatter remains a name/declaration threshold rather than type analysis.

## Q16 Collection Scheduling And Fork Ownership

RED exposed missing v4 child/detached forks, discarded yielded handles and
curried startup construction. GREEN reports direct/curried constructors and
terminal pipe operators with startup options. V4 loop traversal owns only its
body, excluding nested function definitions; v3 bare statements and broad loop
traversal remain unchanged. Parsed counts: five mapped Effect.all warnings per
major, one legacy/eight v4 discarded forks, five loop warnings per major.
Opposite-policy parsed files stay clean; checked negative types reject removed
APIs and unsupported startup options.

Actual runtime contracts retain ordered results and original failure identity.
Deferred-coordinated collection work reaches exactly two active jobs and never
exceeds that repaired budget. Omitted options remain sequential in both installed
majors; bare fork constructions execute zero jobs. Started child/forkScoped/
forkIn work is interrupted once when its owner closes, while detached work
survives the owner and receives explicit interruption and exactly-once cleanup.
Every manifest runtime contract now requires a post-import completion marker
and has a 60-second deadlock watchdog. RED proved early zero exit previously
counted as success; GREEN rejects missing completion evidence.

Ruling: preserve the mapped-all option-presence contract, correcting its false
description of default parallelism. Explicit unbounded option values remain a
documented pre-existing detection gap, not a safety guarantee. Scoped APIs are
excluded from these two fork rules, not proven bounded. Terminal-pipe detection
does not infer observation through arbitrary subsequent operators or stored
aliases; preserving that local scope trades opaque detections for avoiding
false ownership claims. No other concurrency-rule table is changed in Q16.

Fresh 493 tests, root types, both packed majors with completion evidence, build,
size 27.92 KB under 30 KB and diff check pass. Q17-Q52 and cross-group closure
remain open; 97 rules retain an unqualified applicable version.

## Q17 Races, Observations And Retry Budgets

RED exposed enclosing race cleanup, first-completion forms, yielded v4 fiber
initializers and missing packed cases. Parsed clean controls then exposed
curried cleanup arguments and scoped generator ownership; focused regressions
went RED before both fixes. GREEN covers direct/curried/terminal-pipe races,
plain/self-bound gen and named generator fn boundaries, winner options, and
yielded child/detached handles with native Oxlint lexical references.
Final boundary review added a RED regression for an inline acquireUseRelease
use callback; GREEN follows that exact ownership callback and verifies its
resource release once, without inheriting ownership through unrelated functions.
Same-name functions and block-shadow joins cannot hide another v4 binding.
Legacy race argument markers and direct lazy fork initializer/name semantics
are retained, including the documented legacy raceFirst recognition gap.

Parsed counts: races two legacy/seven v4, fibers three legacy/six v4, inline
retry scheduling four per major. Opposite-policy parsing retains two common
race warnings and no foreign fork-initializer warnings. Compiler-negative
fixtures verify raceAllFirst is v4-only and raceWith is removed in v4.
Clean join/await/interrupt, reference pipes, lazy storage, explicit return
ownership and scoped controls typecheck without casts or warning suppression.

Runtime proves first-success versus first-completion outcomes, winner observer
index, original join/await/exhausted-retry failure identity, returned detached
values, and acquired-resource release exactly once under observed interruption.
Deferred-gated winners demonstrate that interrupting a bare resource-owning
loser does not release it, while the explicit ensuring repair does. The retry
repair retains ordered values and two attempts per job while a handshake proves
the two-worker maximum and final active count zero. All manifest runtime
contracts still require post-import completion evidence and a deadlock watchdog.

Ruling: native lexical scope metadata is available in the pinned Oxlint 1.71
plugin API and is not compiler type analysis. Use it for v4 observation instead
of expanding hand-written scope lookup or retaining global-name suppression.
Reference presence is not execution/path proof; stored aliases, aggregate
observers and arbitrary wrappers remain outside scope. Race cleanup remains
a marker heuristic, not per-branch release proof. Preserve the retry
option-presence contract but correct its false description of serial defaults;
explicit unbounded values remain a documented pre-existing gap.

Fresh 496 tests, root types, both packed majors with completion evidence, build,
size 28.46 KB under 30 KB and diff check pass. Q18-Q52 and cross-group closure
remain open; 94 rules retain an unqualified applicable version.

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
