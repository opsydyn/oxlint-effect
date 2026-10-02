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
