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

## Q38 Business Work In Callback Pipes

`no-business-logic-in-pipe` checks inline flatMap callbacks and current
flatMapEager callbacks. It reports the first qualifying callback per pipeline,
not one per operator. All seven control-flow forms, two Effect calls and yielded
identifiers ending Service are covered. The service check is a name heuristic:
a valid Reader service is clean, while its ReaderService alias warns. Broad
walks can also warn on unused nested control flow or a simple two-call map.

Named callbacks, aliased operators and ternaries containing one Effect call are
clean controls, not proof of workflow simplicity. Actual generator/service/pure
repairs preserve true/false 42/0, loop values, provided service output and original
failure identity. The current eager operator is checked under both policies;
legacy ignores it. All four workflow owners now have behavioural evidence, but
package size and whole-campaign closure still block final qualification.
