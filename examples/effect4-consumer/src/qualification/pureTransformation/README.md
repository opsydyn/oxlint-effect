# Pure Transformation Qualification

Q39 checks three flow policies using actual pinned flow APIs in both majors.
`no-large-anonymous-flow` reports five or more stages, including already-named
flows. Naming alone does not satisfy the detector; split into shorter named
pipelines. Four stages and aliased flow calls remain clean controls.

`no-effect-in-flow` reports the first argument containing Effect, async/await,
Promise, console, yield or Runtime markers. It also sees unused nested callbacks
and ordinary values/functions called Runtime/Promise. Named effectful callbacks
and namespace aliases remain opaque. Warnings do not prove runtime impurity;
clean syntax does not prove purity. Move actual Effect work outside pure flow.

`prefer-named-flow` reports at least three inline stages passed to any caller,
including arrays and unrelated helpers. Only the first inline argument is
reported per parent. Named extraction and short inline chains retain values.
Import-order gaps are labelled explicitly.

Runtime contracts check42, array/combined values, async/generator results and
console side effects with restoration in finally. Unused/name false positives
are executed separately. Outer Effect mapping retains original failure identity.
These are lint/type/runtime contracts, not whole-program purity or release proof.

## Q40 Pure Call Towers

`prefer-flow-for-pure-pipeline` reports max nested call depth of three or more,
with outer-only reporting. Branched arguments use maximum depth, not summed call
count. Static/computed methods and curried callees have parsed controls. Actual
named flow and explicit intermediate steps preserve42/84 and failure identity.

Purity is a syntax heuristic. Called definitions are not resolved: an observable
callee can warn as supposedly pure, while a local ordinary fetch name breaks the
depth calculation. A named opaque flow can retain one mutation while staying
clean; it is a counterexample, not a pure repair. Runtime checks compare the
observable call count, and import-order gaps remain labelled. All four owners
have behavioural evidence, with size/campaign closure still outstanding.
