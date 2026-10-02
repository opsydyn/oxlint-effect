# Effect Workflow Qualification

Q37 checks repeated piped yields, tiny mapping generators and long sequencing
pipelines against both pinned majors. Current sequencing counts flatMapEager and
excludes removed zipRight; legacy preserves zipRight and excludes eager syntax.
The shared version selector is tested through the packed rule and opposite policy.

`no-piped-yield-in-gen` reports the second piped yield when two or more are found.
Broad recursion counts nested and unused generators; nested owners can report the
same yield twice. Name already-decorated steps before yielding them. One piped
yield is below threshold, not evidence that all decoration is ideal.

`no-gen-for-mapping` requires exactly a yielded binding and transformed return.
Identity returns, extra statements and named generator callbacks remain clean.
Called transforms are assumed pure by syntax, not proven pure; the runtime
counterexample calls an observable transform exactly once.

`prefer-gen-for-workflow` counts at least three selected sequencing operators in
receiver/free pipe forms. Aliased operators remain opaque. Real generator/map
repairs preserve 42, object shape, event order and original failure identity;
failure short-circuits later events. Compiler-negative fixtures reject removed
current zipRight and foreign legacy eager operators. No application was launched;
this is packed lint/type/runtime-contract QA with size/closure still outstanding.
