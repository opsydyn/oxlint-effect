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

## Q18 Async Boundaries And Shared State

Qualified `no-blocking-call-in-effect`, `no-promise-concurrency-in-effect` and
`no-shared-mutable-state-across-fibers` against Effect 3.21.4, Effect 4.0.0
and native Oxlint 1.71.0 lexical references.

- Blocking: three legacy/six v4 parsed warnings. V3 keeps gen/sync traversal;
  v4 adds self-bound gen and direct/named generator fn, owning only the callback
  scope. Sync suffixes/literal platform-port names are heuristics, not proof of
  imported APIs or blocking latency. Repairs compile/run using legacy async or
  current callback with queueMicrotask, and tryPromise preserves value/error
  identity. A Promise wrapper around a blocking call is not offloading.
- Promise concurrency: six legacy/eight v4 warnings cover all four aggregators,
  map and major-correct catch callbacks, plus v4 self/named generators. Five
  common warnings remain under opposite policy; foreign recovery/generator forms
  are excluded. Legacy either/current result represent typed outcomes, not
  defects or interruption. Ordered values and typed outcomes survive repairs.
  raceFirst retains first-completion failure identity; race preserves first
  success after a failure. Raw Promise.race leaves the loser active; the repaired
  signal-aware adapter aborts an actually started loser exactly once. No claim
  of AggregateError/cause equivalence or cancellation of signal-ignorant APIs.
- Shared state: five legacy/nine v4 warnings cover scalar/collection mutations,
  a deterministic split read/write, and default sequential collection syntax.
  V4 adds child/detached direct/curried/terminal-pipe work. Native binding
  references avoid shadow suppression and exclude worker-local/parameter
  bindings without TypeScript typeAware. V3 name-set behaviour is retained.
  The paired-read handshake produces one instead of two; atomic Ref.update
  repairs it to two and immutable aggregation retains order. Runtime controls
  verify executed fork mutations and untouched shadowed outer state.

Source audit: installed Effect constructor docs specify cooperative AbortSignal
handling and callback cleanup; result captures only typed failures; Ref.update
is atomic. These are narrow repairs, not blanket allSettled/any or shared-memory
equivalence claims. Direct collection argument syntax remains the contract:
stored tasks, const containers, property writes and arbitrary decorated pipes
are not inferred. Collection omission is sequential; lazy fork construction
alone launches nothing. This rule flags coupling, not a proven data race.

Opposite-policy shared/blocking counts are four/three in each consumer.
All bad/good fixtures typecheck in isolated packed consumers without casts or
suppressions; exact per-file counts and runtime completion markers pass.
Fresh gates: 499 tests, root typecheck, both packed consumers, build 136.83 kB
raw, size 28.9 KB under 30 KB, and diff check pass. Q19-Q52 and cross-group
closure remain open; 91 rules retain an unqualified applicable version.

## Q19 Cancellation, Masking And Buffers

Qualified `no-timeout-with-noninterruptible-promise`,
`no-uninterruptible-concurrent-region` and `no-unbounded-queue-or-pubsub`
against the pinned Effect 3.21.4/4.0.0 and Oxlint 1.71.0 consumers.

- Timeout: four legacy/twelve v4 warnings. Legacy direct-timeout policy remains
  unchanged, including its signal-aware promise warning. Both installed majors
  accept signals; the legacy warning is retained policy, not evidence the API
  is intrinsically uncancellable. V4 supports direct, curried and terminal
  method/function pipes for timeout, timeoutOption and timeoutOrElse, accepting
  promise/tryPromise signal parameters. TestClock drives actual timeout, None
  and fallback outcomes; underlying raw work stays open until explicit teardown,
  cooperative work aborts once. An ignored parameter stays lint-clean but does
  not stop its operation. Repairs retain values, original application errors
  and major-specific TimeoutException/TimeoutError failure channels.
- Masking: five legacy/fourteen v4 warnings. Current fork families, success and
  first-completion races, collections and Queue/PubSub waits are covered, with
  own-scope traversal through recognised gen/fn and logic callbacks. Ordinary
  unused helpers stay clean. Terminal uninterruptible pipes are supported;
  legacy broad traversal is preserved. A controlled masked Deferred wait cannot
  finish on interruption until released; restored work finishes before release
  and finalizes exactly once. Restore reinstates ambient status, not forced
  interruption in already-masked callers. Scoping alone does not restore it.
- Buffers: two legacy/nine v4 warnings. V4 Queue.make defaults, missing/undefined
  capacity and literal Infinity spellings are covered, plus atomic unbounded
  PubSub construction. Named/spread/computed options remain opaque. A failing
  regression caught a visible Infinity overwritten by a spread; spreads now
  remain outside inference, avoiding a false claim about the final capacity.
  Runtime checks verify FIFO and unbounded constructor sentinel values, then
  prove bounded Queue/PubSub producers suspend until a consumer drains capacity.
  PubSub has a live scoped subscriber; v4 uses PubSub.take, legacy Queue.take.
  Owned shutdown completes. Dropping/sliding is not a semantics-preserving swap.

Source audit: legacy timeout fails with Cause.TimeoutException, current with
Cause.TimeoutError. Legacy Queue.make is an internal backing-queue/strategy
constructor; current make has capacity/strategy options and defaults to Infinity.
Unbounded PubSub/atomic PubSub reports MAX_SAFE_INTEGER in both majors, not
Infinity. Compiler-negative controls verify Queue constructor, subscription
and timeoutTo/timeoutOrElse differences without casts or lint suppressions.

The watchdog rejected a masked race against a never-ending loser. Tracing showed
the restored wait had completed; the later masked race could not await loser
interruption. Bad race fixtures now use finite branches and still warn; the
controlled masked wait demonstrates delayed shutdown without an unbounded test.
No watchdog, completion marker or warning-count gate was weakened.

Opposite-policy counts are three/four/two in each consumer, retaining common
syntax while excluding foreign generator/fork/timeout/constructor forms.
Fresh gates: 502 tests, root typecheck, both packed consumers including runtime
completion markers and checked API-negative fixtures, build 138.28 kB raw,
size 29.24 KB under 30 KB and diff check pass. Q20-Q52 and cross-group closure
remain open; 88 rules retain an unqualified applicable version. No push/release.

## Q20 Ownership, Coordination And Permits

Qualified `no-global-mutable-concurrency-state`,
`no-manual-deferred-coordination` and `no-yield-with-held-semaphore-permit`
against the pinned Effect 3.21.4/4.0.0 and Oxlint 1.71.0 consumers.

- Global state: seven legacy/ten v4 warnings. Preserve legacy file-wide names,
  including its function-local false positive. V4 requires lexical module/global
  bindings and recognises inline collections and direct/curried/terminal-pipe
  child/detached work, including Array/Map/Set mutations. Local/shadowed bindings
  stay clean; object-property writes and stored task bodies remain outside scope.
  Runtime uses a paired-read handshake to demonstrate a lost module update;
  owned Ref.update retains two updates in separate executions, and immutable
  aggregation retains ordered results. Lazy syntax is not execution/data-race
  proof, and collection defaults remain sequential.
- Deferred: three legacy/six v4 warnings. Native references support captured
  awaits and distinguish a same-name finalizer's different latch. V4 uses
  make/makeUnsafe and current direct/curried/terminal timeout/race forms;
  timeoutOrElse's fallback callback is not protected by the source timeout.
  Legacy constructor spellings, function-scope matching and protection tables
  remain unchanged. Runtime retains 42, original failure identity, external
  interruption and once-only completion. TestClock verifies timeout, None and
  fallback results; a timed-out waiter does not complete the latch. An actual
  registered finalizer interrupts its owned latch on teardown. Scope,
  interruptibility and finalizer reference presence remain syntax markers,
  not proof of execution or eventual completion; a scoped bare-await clean
  control needs explicit caller interruption.
- Permits: six legacy/ten v4 warnings. Legacy Effect.Semaphore exposes
  withPermits, not withPermit. Real TSemaphore forms wrap Effect work, with
  work-first direct and semaphore-first curried arguments. V4 covers current
  instance/namespace APIs, curried/terminal pipes and recognised gen/fn bodies,
  excludes the removed TSemaphore namespace and skips unused ordinary helpers.
  Runtime proves a waiting contender stays blocked by unrelated held work,
  while narrowing the section lets it finish before the external gate releases.
  Success, original failure and interruption retain exactly-once finalization
  and balanced capacity. This strict coordination policy is not leak detection:
  moving intentionally permit-bound async work outside changes concurrency limits.
  Named tasks and other acquisition APIs remain outside inference.

Source audit corrected the runtime probe: both installed implementations return
the acquired count 1 from take(1), not remaining capacity 0. Taking all capacity
and checking withPermitsIfAvailable returns None catches double release; the
subsequent release confirms balance. No watchdog or diagnostic gate was weakened.
Checked compiler-negative controls distinguish Deferred constructor, semaphore
module and permit method differences. Opposite-policy counts are five/two/three
in the legacy consumer and five/three/eight in the v4 consumer.

Fresh gates: 506 tests/3417 expectations, root typecheck, both packed consumers
with exact warning/clean/opposite-policy counts, runtime completion markers and
API-negative controls pass. Build is 140.76 kB raw; size is 29.77 KB under the
approved 30 KB cap. Q21-Q52 and cross-group closure remain open; 85 rules retain
an unqualified applicable version. No push/release.

## Q21 Held Refs, Background Ownership And Acquisition

Qualified `no-yield-with-held-mutable-ref`, `no-unscoped-background-fiber`
and `no-acquire-without-scoped-release` against pinned Effect 3.21.4/4.0.0
and Oxlint 1.71.0 consumers, preserving their preset membership.

- Held refs: seven legacy/ten v4 warnings. Current literal SynchronizedRef and
  SubscriptionRef namespace forms support direct, curried and terminal pipes
  for the four existing modifier names. Recognised gen/fn callbacks include
  current child work; unused ordinary helpers and unrelated methods stay clean.
  Unary modifier factories do not warn before application. Legacy instance and
  namespace forms retain broad traversal. Runtime verifies a gated update holds
  a contender behind the lock; computing an independent delta outside allows
  contender progress first. Success retains both updates, failure/interruption
  leave the failed update uncommitted, and the lock remains usable with one
  finalization. Moving state-dependent I/O outside is not a mechanical repair.
- Background: four legacy/eight v4 warnings. Current forkDetach direct/options,
  curried and terminal method/function pipes warn even with returned/joined
  handles or a scope inside the child. Empty, undefined and inline-options
  factories stay clean; stored aliases/named options remain outside inference.
  Legacy direct forkDaemon and supervised marker policy are unchanged. Runtime
  detached children survive caller completion until explicitly interrupted;
  inner scoping and Supervisor.none do not themselves close them. Actual scoped,
  explicit-scope and child ownership interrupt/finalize on scope/parent exit.
  Intentional detached lifetime is a strict-policy warning, not a proven leak.
- Acquisition: eight legacy/fourteen v4 warnings, reported on acquisition nodes
  and deduplicated across nested roots. Current fork/race families, currying,
  terminal pipes and gen/fn/logic/adapter/mapped callbacks are covered; unused
  definitions stay clean. Legacy broad traversal remains. Naming and existing
  scope/name-matched finalizer exclusions are coarse syntax markers: a bare
  scope does not release a raw resource. Runtime typed stand-ins count actual
  release: unowned acquisition releases zero times on success/failure/interruption
  until explicit teardown; acquireUseRelease releases exactly once and preserves
  43, original error identity and interruption. Scoped acquireRelease and an
  actual registered finalizer also release once. No native filesystem/network
  qualification is claimed, and stored task bodies remain opaque.

Source audit: SynchronizedRef remains exported in v4, but its instance
modifyEffect method does not. V4 modifySomeEffect takes Effect<[result,
Option<state>]> without fallback; legacy takes a fallback plus
Option<Effect<[result,state]>>. Both positive and no-update outcomes preserve
results/state, and checked API negatives reject the foreign signatures. V4
Fiber.interrupt returns void, so runtime checks await the resulting exit rather
than pretending its return is an Exit. V4 forkDaemon/supervised are absent.

Opposite policy retains six/six ref/acquisition warnings in the legacy consumer,
seven/six in v4, and zero foreign daemon/detach warnings in either. The lazy
undefined-options factory regression went RED before its explicit exclusion.

Q21 exceeded the unchanged 30 KB cap. Consolidating equivalent import/report
visitors for Q17-Q21 owners through the existing helper, sharing the current
concurrency/permit traversal and removing redundant namespace guards reduced
the build without changing adjacent predicates, messages or report targets.
The helper's optional multi-target mode retains acquisition deduplication; its
default single-target behaviour remains unchanged. Full packed Q17-Q20 cases
and opposite policies are re-run, not assumed qualified from the refactor.

Fresh gates: 510 tests/3436 expectations, root typecheck, both packed consumers
with exact own/opposite counts, clean controls, API negatives and runtime
completion markers, publint, API docs and diff check pass. Build is 140.39 kB
raw; size passes at 30 KB under the approved cap, with very little headroom.
Q22-Q52 and cross-group closure remain open; 82 rules retain an unqualified
applicable version. No push/release.

## Q22 Cleanup, Manual Scopes And Resource Success Values

Behavioural evidence is complete for `no-manual-resource-close`,
`no-unbound-scope` and `no-resource-succeed-escape` against pinned Effect
3.21.4/4.0.0 and Oxlint 1.71.0. Final qualification remains blocked by size;
the three inventory statuses and Q22 completion checkbox stay unchanged.

- Cleanup: seven legacy/five v4 parsed warnings. All four cleanup methods and
  premature cleanup in the use callback warn. V4 recognises effect-valued
  Scope.addFinalizer arguments, including deferred effects; release callbacks,
  Effect.addFinalizer and Scope.addFinalizerExit are clean. Valid legacy curried
  release and effect-valued finalizer warnings are retained and labelled, not
  disguised as broken APIs. Callback/finalizer presence is not execution proof;
  aliases, computed methods and nested lazy definitions remain inference limits.
- Manual scopes: four legacy/five v4 warnings. Same-function, same-binding
  explicit close and matching acquireRelease/acquireUseRelease callbacks are
  clean; wrong/shadowed bindings and nested helper close do not confer ownership.
  V4 no longer treats Effect.scoped or removed Layer.scoped/acquireReleaseInterruptible
  as ownership of a manually created scope. Legacy marker exclusions remain.
  The supplied Effect.scope is the scoped repair. Close-expression presence is
  not dominance/execution proof: a clean lazy-close control demonstrably remains
  open. No Scope.use/provide alias-flow inference is claimed.
- Success values: six warnings in each major, unchanged and focused-only.
  Literal resource names and nested receiver names are detected, including
  fully owned use (a conservative warning); generic aliases remain clean despite
  carrying the same live resource. Immutable client.value can also warn by
  receiver naming. Returning data from owned use is the repair, not renaming.

Own/opposite parsed counts are cleanup 7/5 versus 6/5, scopes 4/5 versus 4/4,
success values 6/6 under either policy. Default main.ts exclusions are checked
per rule; custom boundary globs suppress the bad file, and boundaryPaths: []
restores exactly one warning per rule in main.ts. Focused tests first failed
on effect-valued finalizers, separate-scope marker ownership and absent manifests.

Checked API negatives reject callback-valued Scope.addFinalizer, closing an
acquisition instead of a scope, missing Exit, foreign strategy signatures and
foreign acquisition forms. V3 acquireReleaseInterruptible receives only Exit;
v4 replaces it with acquireRelease's interruptible option and uses direct-only
acquireUseRelease. Runtime contracts exercise actual typed resources and scopes:
acquireUseRelease, manually acquired Scope and supplied-scope finalization each
preserve 43/original failure identity/interruption and release exactly once.
Repeated Scope.close does not release twice. Premature manual cleanup does;
scope-marker/lazy-close controls remain open until explicit teardown. A returned
scoped handle is already closed, while the data repair returns 42. No native I/O
or whole-program ownership claim is made.

Fresh unit gates pass: 513 tests/3449 expectations, root typecheck, publint,
API docs and diff check. Both packed majors pass the warning counts, clean
controls, checked API negatives and runtime completion markers. These passes
do not override the failed size gate or qualify Q22 for release.

The 30 KB cap is unchanged. Shared import/report visitors now optionally retain
boundary schema/gating and selectable visitor names; resource-lifetime visitors
reuse them with predicates, legacy messages, report nodes and deduplication
preserved. Lifecycle ancestor walking and acquisition recognition are shared;
unqualified Q23/Q24 owners keep legacy-default predicates. This structural
consolidation does not qualify those later owners. Q22's final build is 139.04 kB
raw but exceeds the compressed cap by 123 bytes. Budget approval or a separate
bundle-reduction gate is required before marking Q22 qualified. Q22-Q52 and
cross-group closure remain open; 82 rules retain an unqualified applicable
version. No push, version bump or release.

## Q23 Acquisition, Request Lifetime And Global Resources

Behavioural evidence is complete for `no-resource-without-acquire-release`,
`no-request-scoped-long-lived-resource` and `no-global-resource-singleton` in
both pinned consumers. Final qualification remains pending the size gate.

Acquisition reports eight calls per major, spanning all seven factory verbs
and namespace/member forms. V4 release ownership selects current APIs and
rejects removed legacy markers; legacy predicates/messages remain unchanged.
Direct/scoped/interruptible acquisition typechecks and releases once. Bare
Effect.scoped and terminal scoped pipes retain coarse marker exclusions:
clean controls still allocate unclosed raw resources. Naming is not type proof.

Requests report four legacy/eight current resource nodes. Declarations, function
expressions, arrows and property handlers are covered. V4 crosses recognised
inline gen/fn, mapping and sync/suspend/Promise callbacks, not unused ordinary
functions. Report on resources and deduplicate visitor roots. Preserve legacy
nearest-function traversal. Intentional request-local resources can warn by
strict policy, not leak proof; application-owned service retrieval is clean.

Singletons report five nodes per major, including direct/namespace constructors,
module blocks and static fields. Lazy construction stays clean; aliased
constructors remain opaque, with a live clean counterexample. V4 repair advice
uses Context.Service plus a Layer; legacy Effect.Service advice stays exact.
Request/global sensitivity, inventory, schemas and preset projections change
together. Own/opposite counts: acquisition 8/8, requests 4/8 versus 8/4, globals
5/5. No-import and custom/replaced boundary controls are checked per rule.

Checked types distinguish legacy Layer.scoped from current Layer.effect scope
removal and reject running an acquisition without Scope. Runtime stand-ins prove
raw acquisition releases zero times on success/failure/interruption until manual
teardown, while acquireUseRelease and the application Layer release once and
preserve 43/original errors/interruption. Raw requests allocate distinct live
pools; two requests under one Layer share a pool and return 42/42 before one
shutdown. Eager global and aliased constructors are explicitly torn down. No
native I/O or whole-program alias ownership is claimed.

Fresh gates: 517 tests/3466 expectations, root types, both packed major contracts,
exact own/opposite counts, clean controls, publint, API docs and diff check pass.
Build is 139.41 kB raw; size exceeds unchanged 30 KB by 208 bytes. Q22/Q23
remain unchecked and inventory statuses stay baseline/pending; 82 rules retain
an unqualified applicable version. Q24-Q52 and cross-group closure remain.
No push, version bump or release.

## Q24 Nested Ownership, Visible Provision And Held-Resource Execution

Behavioural evidence passes for all three owners in both pinned consumers;
final qualification remains pending the unchanged 30 KB compressed-size gate.
Nesting reports three warnings per major (opposite policy two/three), counting
descendant acquisitions including siblings rather than depth alone. Current
policy excludes removed acquireReleaseInterruptible; legacy text is unchanged.
Named composition preserves value 127, original failures and interruption,
reverse third/second/first release order and exactly one close per acquired pool.

Provision reports eight legacy/eleven current warnings (opposite eight/eight).
V4 uses native binding identity for stored programs, skips unused ordinary
functions and no longer treats a run*With context as automatic visible provision.
Legacy first-name traversal and diagnostics remain unchanged. This is strict
syntax policy: valid fully populated contexts and ordinary Service-shaped effects
can warn, while an unexecuted provide marker can suppress a warning. Actual
typed service/Layer repairs compile and close once; context-only and marker-only
controls execute successfully but need external teardown. No dependency
completeness, type inference or whole-program provision proof is claimed.

Open-resource execution reports ten legacy/thirteen current warnings (opposite
ten/ten). Real With execution is included; lazy factory creation is not. Resource
ownership selects major-specific APIs. Lexical co-occurrence retains warnings on
acquisition after execution and manually closed handles, while opaque factories
remain missed. This owner has no boundaryPaths option. Explicit Deferred
readiness coordinates success, original failure and interruption: raw runners
close zero times until teardown, managed runners close once, both return 43 on
success. Typed stand-ins do not establish native I/O behaviour.

Fresh gates pass: 521 tests/3479 expectations, root typecheck, both packed major
consumers with exact own/opposite counts and runtime completion markers,
publint, API docs and diff check. Build is 140.00 kB raw, compressed size 30.33 KB,
330 bytes over the unchanged cap. Q22-Q24 statuses/checkmarks stay open; 82
rules retain an unqualified applicable version. Q25-Q52 and cross-group closure
remain. No push, cap increase, version bump or release.

## Q25 Execution, Boundary Recovery And Filesystem Portability

Behavioural evidence passes for all three owners in both pinned consumers.
Hidden execution reports six legacy/twelve current warnings (opposite six/six),
covering six runner forms and actual current With execution, not factories.
Default/custom/replaced boundaries and no-import controls pass. Literal runner
aliases remain opaque. Runtime callbacks, fiber exits, direct/contextual runners
and the returned-program repair all preserve 42.

Boundary catches report four legacy/five current warnings, including a separate
no-import boundary file. V4 now recognises current catch/Cause/reason recovery,
not removed catchAll; legacy detection and exact advice remain unchanged. The
opposite policy reports one warning in each repaired recovery file. Empty/custom
boundary replacements are verified. The policy checks handling marker presence,
not execution: an unused callback still suppresses it. Typed mapping preserves
original error identity; recovery returns the original tagged error. Raw catches
erase identity. Deferred readiness verifies mapped interruption without timing.

Filesystem policy reports nine nodes per major: four imports, four module-scope
require calls and one application-boundary import. There is no boundary exemption;
function-local require and non-Effect modules retain clean gaps. Repairs use real
typed FileSystem services: pinned @effect/platform 0.96.2 for v3, builtin FileSystem
for v4. Pinned Node declarations qualify native module types. No-op service reads
return 42; real temporary files exercise every import/require variant and missing
file failure with finally cleanup. No native adapter cancellation claim is made.

Compiler evidence corrected fixture assumptions: both majors take callback
runner options; current Fiber.interrupt returns void, so await the fiber to inspect
its exit. No casts, API suppressions in failure examples or weakened gates.
Fresh gates pass: 523 tests/3501 expectations, root types, both packed majors
including final own/opposite/boundary counts and runtime markers, publint,
API docs and diff. Build 140.20 kB raw; unchanged 30 KB cap fails by 398 bytes.
Q22-Q25 remain unchecked; 82 rules retain unqualified applicable versions.
Continue Q26-Q52 and cross-group closure; no push, version bump or release.

## Q26 Schema Boundaries, Clock And Shared Platform Imports

Behavioural evidence passes for three owners in both pinned consumers; final
qualification remains pending the unchanged compressed-size cap. JSON parsing
reports four warnings per major/opposite policy. Root, deep, aliased and type-only
Schema import controls retain the import-presence exclusion. Marker-only examples
accept invalid field values, demonstrating that an import does not prove decoding.
Real string codecs use legacy parseJson/decodeUnknown versus current
fromJsonString/decodeUnknownEffect; v4 advice now matches that API, while legacy
text remains exact. Valid count 42 passes and malformed JSON/shape fail in the
Effect channel, not via an eager parser exception. Checked API negatives pass.

Clock reads report eight legacy/ten current warnings (opposite nine/eight).
Current fnUntraced/fnUntracedEager forms are recognised; legacy retains its valid
untraced-function gap. Sensitivity, schema and preset inventory agree. Common
constructors, curried fn, nested dedup and no-import controls pass. Broad traversal
retains an unused-callback false positive; named callbacks and aliases remain
opaque. TestClock verifies reads 1000 then 2000 and deterministic named fn time.
Wall-clock controls are type/value checks, not determinism evidence.

Shared-platform imports report six nodes per major, including prefixed, bare,
subpath and type-only imports in files without an Effect import. Default/custom,
replaced and empty boundary controls pass. Require remains opaque. A real typed
path service returns the fixture basename like the native boundary; this injected
stand-in does not qualify OS-wide path semantics or portability of opaque code.

Fresh gates pass: 525 tests/3510 expectations, root types, both packed majors
including final opposite/boundary/runtime markers, publint, API docs and diff.
Build 140.35 kB raw; unchanged 30 KB compressed cap fails by 385 bytes. Q22-Q26
remain unchecked, 82 rules retain unqualified applicable versions. Continue
Q27-Q52 and cross-group closure; no push, version bump or release.

## Q27 Ambient Environment And Owned Configuration

Behavioural evidence passes in both pinned consumers with unchanged detector
policy. Ten warnings per major cover direct/computed/dynamic/optional reads,
destructuring and whole-environment access. There is no Effect import gate.
Literal-name matching retains warnings on a local process object and delete;
imported aliases, destructured process objects and compound assignments remain
clean gaps. These are documented rather than treated as ownership repairs.

Both boundaryPaths and configPaths replace defaults; custom and empty-array
controls verify each option independently. Actual typed repairs use legacy
Config.integer/ConfigProvider.fromMap/Layer.setConfigProvider versus current
Config.Int/ConfigProvider.fromUnknown/ConfigProvider.layer. Checked API negatives
pass. The injected provider decodes 42 and remains stable when ambient state
changes; missing/malformed integers fail through Effect. Raw reads observe
mutation. Runtime controls restore every private environment key in finally.

Fresh gates pass: 526 tests/3512 expectations, root types, both packed majors
including final path controls and runtime markers, publint, API docs and diff.
Build stays 140.35 kB raw; unchanged 30 KB size cap fails by 385 bytes. Q22-Q27
remain unchecked; 82 rules retain unqualified applicable versions. Continue
Q28-Q52 and cross-group closure; no push, version bump or release.

## Q28 Logger Context And Span Lifetime

Behavioural evidence passes for three observability owners in both pinned
consumers. Console reports nine legacy/thirteen current warnings (opposite nine
per major), including current untraced constructors and class/functional/expression
Context.Service.make shapes. Logging reports five legacy/eight current warnings
(opposite three/two), selecting current recovery and observer callbacks, literal
handler maps and selected-major service implementations. A current tapError owner
regression from reusing a narrower callback helper was reproduced RED, corrected
with explicit handler extraction and verified GREEN. Span policy reports eight
legacy/ten current warnings (opposite seven/seven) across five exported function
shapes, partial branches, stored values and own-major service methods.

Legacy traversal and exact messages are retained. Three collectors share deferred
import gating and node deduplication; imports declared later still activate the
policy. Current service methods follow visible make constructions through plain
functions, gen/fn, succeed/sync and pipes. No alias/type/whole-program proof is
claimed. Unused console callbacks can warn; empty log objects and unused annotation
markers remain clean correlation gaps. Inferred exports and disabled tracing stay
clean, while stored Effects and pipes on opaque receivers can conservatively warn.

Actual Logger APIs differ: v3 replace(defaultLogger, custom) versus current
Logger.layer. Console bypass emits no captured logger event; the repair routes
one event while retaining 42. Recovery retains 42, log payloads retain the original
error, annotations retain requestId, and observers preserve typed failure identity.
Real tracer wrappers record pending ownership, success/failure/interruption and
one end per span. Source/runtime evidence shows v3 tracing proxies object failures;
public Cause.originalError recovers the original instance. Untraced legacy and
current fixture failures retain strict reference identity. Disabled tracing creates
no captured span despite clean syntax. Checked ecosystem negatives compile.

Fresh gates pass: 529 tests/3525 expectations, root types, both packed major
consumers with exact own/opposite counts and runtime markers, publint, API docs
and diff. Sandbox cache restrictions caused one pack-test failure; a writable
temporary npm cache restored it. The network-restricted packed run was stopped
and rerun with approved network access; no test was bypassed. Build is 140.81 kB
raw; unchanged 30 KB cap fails by 600 bytes. Q22-Q28 remain unchecked, 82 rules
retain unqualified applicable versions. Continue Q29-Q52 and cross-group closure;
no push, version bump or release.

## Q29 Test Completion, Typed Failures And Default Layers

Three owners have packed, typechecked failures and repairs on both pinned majors.
Discarded runner and rejects owners emit 5 legacy/6 current warnings; selecting
the opposite policy emits 5/5. Current applied runPromiseWith is recognised;
creating its factory alone is clean. Mock/default owner emits 3 warnings per
major under either policy. Copying each bad file outside test paths is clean.
No-import controls remain clean. Real Bun fixtures pass 22 tests/14 expectations
for legacy and 26 tests/15 expectations for current, including intentionally
lint-failing assertions. Explicit relative paths ensure Bun executes files rather
than treating them as unmatched filters.

Deferred runtime contracts prove a discarded callback returns before completion;
the task is then explicitly completed and its retained promise awaited for
deterministic teardown. Await/return repairs preserve 42. Effect.flip assertions
recover the original typed-error reference, while defects remain failures. The
rejects rule still warns on defects: blanket flip advice is conservative and is
not a valid defect recovery repair. Stored assertions, nested discarded calls
and aliased runners remain documented syntax-local gaps.

Legacy Effect.Service supplies Default; current Context.Service does not, so the
typed current fixture explicitly defines its own Default layer. Default wiring
and dedicated services both return 42. The detector uses names/direct arguments,
not dependency semantics: legitimate dependency mocks and unrelated Default
properties can warn; moving a mock to an alias is a clean syntax change, not a
semantic repair. No broad policy rewrite is made in this compatibility batch.

Fresh gates pass: 531 root tests/3534 expectations, root types, final packed
consumers with own/opposite/source controls and actual Bun tests, publint, API
docs and diff. Build is 140.96 kB raw; unchanged 30 KB cap fails by 649 bytes.
Q22-Q29 and applicable inventory statuses remain open; 82 rules are unqualified.
Continue Q30-Q52 and cross-group closure; no push, version bump or release.

## Q30 Domain Identity, Commands And Vocabulary

Both pinned majors emit 4 ID-alias, 10 boolean-flag and 8 string-comparison
diagnostics with unchanged production detection. All prefix/function forms,
multiple parameters, all equality operators and reversed literals are checked.
No-import and import-after-declaration controls remain clean gaps. Indirect and
union ID aliases, default/destructured/aliased booleans and stored vocabulary
are opaque. The string rule conservatively reports legitimate discriminants,
non-domain strings and typeof-string checks. Only exact typeof-boolean is exempt;
the first packed run caught the mistaken broader exclusion and its fixture was
corrected from source evidence, not by weakening the detector.

Actual own-major repairs combine Schema nonempty validation with independent
brands, explicit tagged commands and exhaustive Match mapping. V3 uses minLength,
Schema.Schema.Type and variadic Literal; v4 uses check(isMinLength), schema.Type
and Literals(array). Compiler negatives reject swapped brands, raw IDs, boolean
commands and unknown statuses. Runtime contracts preserve string encoding,
notification intent and 42/0 mapping, and invalid inputs fail through Effect.
Branding alone is not validation. Group documentation distinguishes repairs from
clean gaps. Local whole-consumer tsc without packed installation cannot resolve
the plugin; isolated packed tsc is the authoritative consumer declaration gate.

Fresh gates pass: 532 tests/3540 expectations, root types, both packed consumers,
publint, API docs and diff. No production changes: build remains 140.96 kB raw,
649 bytes over the unchanged 30 KB cap. Q22-Q30 and inventory statuses stay open;
82 rules remain unqualified. Continue Q31-Q52 and closure without release.

## Q31 Primitive Commands, Time Models And Options

Unchanged detectors emit 4 primitive-parameter, 15 raw-time-field and 5 overloaded
options diagnostics per pinned major. Controls cover function forms, multiple
parameters, all 13 time names and optional/type-literal fields. Threshold, name,
alias, union, default, no-import and import-order gaps are explicitly labelled.
An unknown options annotation alone does not prove decoding.

Own-major Schema repairs validate named commands with branded IDs and finite
positive amounts. Runtime checks preserve command identity and encoded fields,
rejecting empty IDs and negative/infinite amounts. Checked options construct
DateTime.Utc and Duration values; epoch milliseconds and 1500 ms/1.5 seconds
round-trip unchanged. The final boundary additionally rejects fractional and
out-of-range epochs before unsafe construction, plus missing/string/negative
duration inputs. Compiler checks reject raw IDs/amounts and swapped time values.
Current makeUnsafe versus legacy unsafeMake and matching Schema filter APIs are
selected from pinned source; no casts conceal differences.

Fresh gates pass: 533 tests/3546 expectations, root and selected source types,
final packed majors, publint, API docs and diff. Build remains 140.96 kB raw,
649 bytes over the unchanged 30 KB cap. Q22-Q31 and inventory statuses stay
open; 82 rules remain unqualified. Continue Q32-Q52 and closure, no release.

## Q32 Eligibility, Lifecycle And Failure Context

Unchanged detectors emit 5 compound-condition, 4 lifecycle-flag and 4 ad-hoc
error warnings per major. Nested logical expressions deliberately retain their
report multiplicity. Merely naming a three-comparison predicate is not a clean
repair; the fixture records that advice limit and uses Predicate.every over
individual named checks. Runtime controls preserve valid eligibility and reject
negative/unfunded/unverified candidates without claiming all domain invariants.

The state owner checks recognised non-computed flags on one identifier; repeated,
computed, different-object and aliased flags remain clean. Actual own-major
Schema tagged unions and exhaustive Match transitions preserve IDs, terminal
state identity and idempotence. Contradictory flag objects fail decoding; compiler
checks require receipt context. V3 uses variadic Union; v4 uses array Union.

Literal Effect.fail/thrown new Error forms warn, while stored/template/dynamic
errors remain opaque. Data.TaggedError carries user ID, reason and original cause;
catchTag recovery preserves the exact instance and fields, while an unrecovered
error remains failure. Compiler checks require context. No-import and late-import
controls remain explicit gaps rather than semantic repairs.

Fresh gates pass: 534 tests/3552 expectations, root and selected source types,
both packed majors, publint, API docs and diff. Build remains 140.96 kB raw;
unchanged cap fails by 649 bytes. Q22-Q32 and inventory statuses stay open,
82 rules unqualified. Continue Q33-Q52 and campaign closure without release.

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
