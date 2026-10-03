# Effect 4 Qualification Corpus

Primary current QA corpus. All anti-patterns remain intentional.
Each manifest entry selects one rule, literal per-file counts and clean repairs.
Group READMEs describe supported variants and known syntax gaps; a gap is not
an endorsed repair. Runtime contracts exercise actual pinned APIs, not a running
frontend/backend application. Package size and release closure are separate gates.

## reactAndRuntimeBoundaries

- `no-run-effect-outside-boundary`: [failure](../recovery-runtime/runners.ts), [repair](../recovery-runtime/valid.ts).
- `no-react-state`: [failure](reactAndRuntimeBoundaries/no-react-state.bad.ts), [repair](reactAndRuntimeBoundaries/react-state.good.ts).
- `no-or-die-outside-boundary`: [failure](reactAndRuntimeBoundaries/no-or-die-outside-boundary.bad.ts), [repair](reactAndRuntimeBoundaries/typed-failure.good.ts).
- `prevent-dynamic-imports`: [failure](reactAndRuntimeBoundaries/prevent-dynamic-imports.bad.ts), [repair](reactAndRuntimeBoundaries/static-loading.good.ts).
- `no-render-side-effects`: [failure](reactAndRuntimeBoundaries/no-render-side-effects.bad.ts), [repair](reactAndRuntimeBoundaries/render-action.good.ts).
- `no-inline-runtime-provide`: [failure](reactAndRuntimeBoundaries/no-inline-runtime-provide.bad.ts), [repair](reactAndRuntimeBoundaries/runtime-boundary.good.ts).

## effectComposition

- `no-effect-as`: [failure](effectComposition/no-effect-as.bad.ts), [repair](effectComposition/no-effect-as.good.ts).
- `no-effect-do`: [failure](effectComposition/no-effect-do.bad.ts), [repair](effectComposition/no-effect-do.good.ts).
- `no-effect-bind`: [failure](effectComposition/no-effect-bind.bad.ts), [repair](effectComposition/no-effect-bind.good.ts).
- `no-effect-ignore`: [failure](effectComposition/no-effect-ignore.bad.ts), [repair](effectComposition/no-effect-ignore.good.ts).
- `no-effect-never`: [failure](effectComposition/no-effect-never.bad.ts), [repair](effectComposition/no-effect-never.good.ts).
- `no-effect-fn-generator`: [failure](effectComposition/no-effect-fn-generator.bad.ts), [repair](effectComposition/no-effect-fn-generator.good.ts).
- `no-nested-effect-gen`: [failure](effectComposition/no-nested-effect-gen.bad.ts), [repair](effectComposition/no-nested-effect-gen.good.ts).
- `no-yield-without-star-in-effect-gen`: [failure](effectComposition/no-yield-without-star-in-effect-gen.bad.ts), [repair](effectComposition/no-yield-without-star-in-effect-gen.good.ts).
- `no-async-effect-combinator-callback`: [failure](effectComposition/no-async-effect-combinator-callback.bad.ts), [repair](effectComposition/no-async-effect-combinator-callback.good.ts).
- `no-throw-in-effect-logic`: [failure](effectComposition/no-throw-in-effect-logic.bad.ts), [repair](effectComposition/no-throw-in-effect-logic.good.ts).
- `no-try-catch-in-effect-logic`: [failure](effectComposition/no-try-catch-in-effect-logic.bad.ts), [repair](effectComposition/no-try-catch-in-effect-logic.good.ts).
- `no-promise-api-in-effect-logic`: [failure](effectComposition/no-promise-api-in-effect-logic.bad.ts), [repair](effectComposition/no-promise-api-in-effect-logic.good.ts).
- `no-swallowed-catch-all`: [failure](effectComposition/no-swallowed-catch-all.bad.ts), [repair](effectComposition/no-swallowed-catch-all.good.ts).
- `no-manual-effect-channels`: [failure](effectComposition/no-manual-effect-channels.bad.ts), [repair](effectComposition/no-manual-effect-channels.good.ts).
- `no-effect-type-alias`: [failure](effectComposition/no-effect-type-alias.bad.ts), [repair](effectComposition/no-effect-type-alias.good.ts).
- `no-public-generic-effect-error`: [failure](effectComposition/no-public-generic-effect-error.bad.ts), [repair](effectComposition/no-public-generic-effect-error.good.ts).

## concurrencySafety

- `no-unbounded-effect-all`: [failure](concurrencySafety/no-unbounded-effect-all.bad.ts), [repair](concurrencySafety/no-unbounded-effect-all.good.ts).
- `no-fire-and-forget-fork`: [failure](concurrencySafety/no-fire-and-forget-fork.bad.ts), [repair](concurrencySafety/no-fire-and-forget-fork.good.ts).
- `no-fork-in-loop`: [failure](concurrencySafety/no-fork-in-loop.bad.ts), [repair](concurrencySafety/no-fork-in-loop.good.ts).
- `no-race-without-cleanup`: [failure](concurrencySafety/no-race-without-cleanup.bad.ts), [repair](concurrencySafety/no-race-without-cleanup.good.ts).
- `no-unobserved-fiber`: [failure](concurrencySafety/no-unobserved-fiber.bad.ts), [repair](concurrencySafety/no-unobserved-fiber.good.ts).
- `no-unbounded-concurrent-retry`: [failure](concurrencySafety/no-unbounded-concurrent-retry.bad.ts), [repair](concurrencySafety/no-unbounded-concurrent-retry.good.ts).
- `no-blocking-call-in-effect`: [failure](concurrencySafety/no-blocking-call-in-effect.bad.ts), [repair](concurrencySafety/no-blocking-call-in-effect.good.ts).
- `no-promise-concurrency-in-effect`: [failure](concurrencySafety/no-promise-concurrency-in-effect.bad.ts), [repair](concurrencySafety/no-promise-concurrency-in-effect.good.ts).
- `no-shared-mutable-state-across-fibers`: [failure](concurrencySafety/no-shared-mutable-state-across-fibers.bad.ts), [repair](concurrencySafety/no-shared-mutable-state-across-fibers.good.ts).
- `no-timeout-with-noninterruptible-promise`: [failure](concurrencySafety/no-timeout-with-noninterruptible-promise.bad.ts), [repair](concurrencySafety/no-timeout-with-noninterruptible-promise.good.ts).
- `no-uninterruptible-concurrent-region`: [failure](concurrencySafety/no-uninterruptible-concurrent-region.bad.ts), [repair](concurrencySafety/no-uninterruptible-concurrent-region.good.ts).
- `no-unbounded-queue-or-pubsub`: [failure](concurrencySafety/no-unbounded-queue-or-pubsub.bad.ts), [repair](concurrencySafety/no-unbounded-queue-or-pubsub.good.ts).
- `no-global-mutable-concurrency-state`: [failure](concurrencySafety/no-global-mutable-concurrency-state.bad.ts), [repair](concurrencySafety/no-global-mutable-concurrency-state.good.ts).
- `no-manual-deferred-coordination`: [failure](concurrencySafety/no-manual-deferred-coordination.bad.ts), [repair](concurrencySafety/no-manual-deferred-coordination.good.ts).
- `no-yield-with-held-semaphore-permit`: [failure](concurrencySafety/no-yield-with-held-semaphore-permit.bad.ts), [repair](concurrencySafety/no-yield-with-held-semaphore-permit.good.ts).
- `no-yield-with-held-mutable-ref`: [failure](concurrencySafety/no-yield-with-held-mutable-ref.bad.ts), [repair](concurrencySafety/no-yield-with-held-mutable-ref.good.ts).
- `no-unscoped-background-fiber`: [failure](concurrencySafety/no-unscoped-background-fiber.bad.ts), [repair](concurrencySafety/no-unscoped-background-fiber.good.ts).
- `no-acquire-without-scoped-release`: [failure](concurrencySafety/no-acquire-without-scoped-release.bad.ts), [repair](concurrencySafety/no-acquire-without-scoped-release.good.ts).

## resourceLifetime

- `no-manual-resource-close`: [failure](resourceLifetime/no-manual-resource-close.bad.ts), [repair](resourceLifetime/no-manual-resource-close.good.ts).
- `no-unbound-scope`: [failure](resourceLifetime/no-unbound-scope.bad.ts), [repair](resourceLifetime/no-unbound-scope.good.ts).
- `no-resource-succeed-escape`: [failure](resourceLifetime/no-resource-succeed-escape.bad.ts), [repair](resourceLifetime/no-resource-succeed-escape.good.ts).
- `no-resource-without-acquire-release`: [failure](resourceLifetime/no-resource-without-acquire-release.bad.ts), [repair](resourceLifetime/no-resource-without-acquire-release.good.ts).
- `no-request-scoped-long-lived-resource`: [failure](resourceLifetime/no-request-scoped-long-lived-resource.bad.ts), [repair](resourceLifetime/no-request-scoped-long-lived-resource.good.ts).
- `no-global-resource-singleton`: [failure](resourceLifetime/no-global-resource-singleton.bad.ts), [repair](resourceLifetime/no-global-resource-singleton.good.ts).
- `no-nested-acquire-release`: [failure](resourceLifetime/no-nested-acquire-release.bad.ts), [repair](resourceLifetime/no-nested-acquire-release.good.ts).
- `no-missing-layer-provision-at-run`: [failure](resourceLifetime/no-missing-layer-provision-at-run.bad.ts), [repair](resourceLifetime/no-missing-layer-provision-at-run.good.ts).
- `no-run-with-open-resource`: [failure](resourceLifetime/no-run-with-open-resource.bad.ts), [repair](resourceLifetime/no-run-with-open-resource.good.ts).

## pipelineShapeAndSequencing

- `no-nested-effect-call`: [failure](pipelineShapeAndSequencing/deep-effect.bad.ts), [repair](pipelineShapeAndSequencing/deep-effect.good.ts).
- `no-effect-ladder`: [failure](pipelineShapeAndSequencing/deep-effect.bad.ts), [repair](pipelineShapeAndSequencing/deep-effect.good.ts).
- `no-flatmap-ladder`: [failure](pipelineShapeAndSequencing/no-flatmap-ladder.bad.ts), [repair](pipelineShapeAndSequencing/no-flatmap-ladder.good.ts).
- `no-pipe-ladder`: [failure](pipelineShapeAndSequencing/no-pipe-ladder.bad.ts), [repair](pipelineShapeAndSequencing/no-pipe-ladder.good.ts).
- `no-call-tower`: [failure](pipelineShapeAndSequencing/no-call-tower.bad.ts), [repair](pipelineShapeAndSequencing/no-call-tower.good.ts).
- `no-effect-wrapper-alias`: [failure](pipelineShapeAndSequencing/no-effect-wrapper-alias.bad.ts), [repair](pipelineShapeAndSequencing/no-effect-wrapper-alias.good.ts).
- `warn-effect-sync-wrapper`: [failure](pipelineShapeAndSequencing/warn-effect-sync-wrapper.bad.ts), [repair](pipelineShapeAndSequencing/warn-effect-sync-wrapper.good.ts).
- `no-effect-side-effect-wrapper`: [failure](pipelineShapeAndSequencing/no-effect-side-effect-wrapper.bad.ts), [repair](pipelineShapeAndSequencing/no-effect-side-effect-wrapper.good.ts).
- `no-effect-all-step-sequencing`: [failure](pipelineShapeAndSequencing/no-effect-all-step-sequencing.bad.ts), [repair](pipelineShapeAndSequencing/no-effect-all-step-sequencing.good.ts).
- `no-effect-succeed-variable`: [failure](pipelineShapeAndSequencing/no-effect-succeed-variable.bad.ts), [repair](pipelineShapeAndSequencing/no-effect-succeed-variable.good.ts).

## branchingAndLocalControlFlow

- `no-if-statement`: [failure](branchingAndLocalControlFlow/no-if-statement.bad.ts), [repair](branchingAndLocalControlFlow/branching.good.ts).
- `no-switch-statement`: [failure](branchingAndLocalControlFlow/no-switch-statement.bad.ts), [repair](branchingAndLocalControlFlow/branching.good.ts).
- `no-ternary`: [failure](branchingAndLocalControlFlow/no-ternary.bad.ts), [repair](branchingAndLocalControlFlow/branching.good.ts).
- `no-try-catch`: [failure](branchingAndLocalControlFlow/no-try-catch.bad.ts), [repair](branchingAndLocalControlFlow/wrappers.good.ts).
- `no-arrow-ladder`: [failure](branchingAndLocalControlFlow/no-arrow-ladder.bad.ts), [repair](branchingAndLocalControlFlow/wrappers.good.ts).
- `no-iife-wrapper`: [failure](branchingAndLocalControlFlow/no-iife-wrapper.bad.ts), [repair](branchingAndLocalControlFlow/wrappers.good.ts).
- `no-return-in-arrow`: [failure](branchingAndLocalControlFlow/no-return-in-arrow.bad.ts), [repair](branchingAndLocalControlFlow/callbacks.good.ts).
- `no-return-in-callback`: [failure](branchingAndLocalControlFlow/no-return-in-callback.bad.ts), [repair](branchingAndLocalControlFlow/callbacks.good.ts).
- `no-return-null`: [failure](branchingAndLocalControlFlow/no-return-null.bad.ts), [repair](branchingAndLocalControlFlow/absence.good.ts).
- `no-branch-in-object`: [failure](branchingAndLocalControlFlow/no-branch-in-object.bad.ts), [repair](branchingAndLocalControlFlow/object-selection.good.ts).

## optionMatchAndDataNormalization

- `no-option-as`: [failure](optionMatchAndDataNormalization/no-option-as.bad.ts), [repair](optionMatchAndDataNormalization/no-option-as.good.ts).
- `no-match-void-branch`: [failure](optionMatchAndDataNormalization/no-match-void-branch.bad.ts), [repair](optionMatchAndDataNormalization/no-match-void-branch.good.ts).
- `no-match-effect-branch`: [failure](optionMatchAndDataNormalization/no-match-effect-branch.bad.ts), [repair](optionMatchAndDataNormalization/no-match-effect-branch.good.ts).
- `no-model-overlay-cast`: [failure](optionMatchAndDataNormalization/no-model-overlay-cast.bad.ts), [repair](optionMatchAndDataNormalization/no-model-overlay-cast.good.ts).
- `no-unknown-boolean-coercion-helper`: [failure](optionMatchAndDataNormalization/no-unknown-boolean-coercion-helper.bad.ts), [repair](optionMatchAndDataNormalization/no-unknown-boolean-coercion-helper.good.ts).
- `no-fromnullable-nullish-coalesce`: [failure](optionMatchAndDataNormalization/no-fromnullable-nullish-coalesce.bad.ts), [repair](optionMatchAndDataNormalization/no-fromnullable-nullish-coalesce.good.ts).
- `no-option-boolean-normalization`: [failure](optionMatchAndDataNormalization/no-option-boolean-normalization.bad.ts), [repair](optionMatchAndDataNormalization/no-option-boolean-normalization.good.ts).
- `no-string-sentinel-return`: [failure](optionMatchAndDataNormalization/no-string-sentinel-return.bad.ts), [repair](optionMatchAndDataNormalization/no-string-sentinel-return.good.ts).
- `no-string-sentinel-const`: [failure](optionMatchAndDataNormalization/no-string-sentinel-const.bad.ts), [repair](optionMatchAndDataNormalization/no-string-sentinel-const.good.ts).

## atomStateAndPlatformBoundaries

- `no-effect-sync-console`: [failure](atomStateAndPlatformBoundaries/no-effect-sync-console.bad.ts), [repair](atomStateAndPlatformBoundaries/logging.good.ts).
- `no-atom-registry-effect-sync`: [failure](atomStateAndPlatformBoundaries/no-atom-registry-effect-sync.bad.ts), [repair](atomStateAndPlatformBoundaries/registry-actions.good.ts).
- `no-family-collection-read`: [failure](atomStateAndPlatformBoundaries/no-family-collection-read.bad.ts), [repair](atomStateAndPlatformBoundaries/keyed-family.good.ts).
- `no-naked-object-state-update`: [failure](atomStateAndPlatformBoundaries/no-naked-object-state-update.bad.ts), [repair](atomStateAndPlatformBoundaries/state-rebuild.good.ts).
- `no-wrapgraphql-catchall`: [failure](atomStateAndPlatformBoundaries/no-wrapgraphql-catchall.bad.ts), [repair](atomStateAndPlatformBoundaries/envelope-mapping.good.ts).

## domainModeling

- `no-raw-domain-id-alias`: [failure](domainModeling/no-raw-domain-id-alias.bad.ts), [repair](domainModeling/no-raw-domain-id-alias.good.ts).
- `no-boolean-domain-flag`: [failure](domainModeling/no-boolean-domain-flag.bad.ts), [repair](domainModeling/no-boolean-domain-flag.good.ts).
- `no-magic-domain-string`: [failure](domainModeling/no-magic-domain-string.bad.ts), [repair](domainModeling/no-magic-domain-string.good.ts).
- `no-raw-domain-primitive-params`: [failure](domainModeling/no-raw-domain-primitive-params.bad.ts), [repair](domainModeling/no-raw-domain-primitive-params.good.ts).
- `no-raw-time-domain-field`: [failure](domainModeling/no-raw-time-domain-field.bad.ts), [repair](domainModeling/no-raw-time-domain-field.good.ts).
- `no-overloaded-options-object`: [failure](domainModeling/no-overloaded-options-object.bad.ts), [repair](domainModeling/no-overloaded-options-object.good.ts).
- `no-domain-logic-in-conditional`: [failure](domainModeling/no-domain-logic-in-conditional.bad.ts), [repair](domainModeling/no-domain-logic-in-conditional.good.ts).
- `no-implicit-state-machine-object`: [failure](domainModeling/no-implicit-state-machine-object.bad.ts), [repair](domainModeling/no-implicit-state-machine-object.good.ts).
- `no-adhoc-domain-error`: [failure](domainModeling/no-adhoc-domain-error.bad.ts), [repair](domainModeling/no-adhoc-domain-error.good.ts).
- `no-domain-meaning-by-folder-only`: [failure](domainModeling/no-domain-meaning-by-folder-only.bad.ts), [repair](domainModeling/no-domain-meaning-by-folder-only.good.ts).
- `no-new-date-in-domain-logic`: [failure](domainModeling/no-new-date-in-domain-logic.bad.ts), [repair](domainModeling/no-new-date-in-domain-logic.good.ts).

## errorModeling

- `no-effect-fail-error-message`: [failure](../failures.ts), [repair](../valid.ts).
- `no-catchall-generic-rethrow`: [failure](../recovery-runtime/rethrow.ts), [repair](../recovery-runtime/valid.ts).
- `no-early-catchall-null`: [failure](../recovery-runtime/fallback.ts), [repair](../recovery-runtime/valid.ts).
- `no-error-as-public-effect-error`: [failure](errorModeling/no-error-as-public-effect-error.bad.ts), [repair](errorModeling/no-error-as-public-effect-error.good.ts).
- `no-unknown-public-error-channel`: [failure](errorModeling/no-unknown-public-error-channel.bad.ts), [repair](errorModeling/no-unknown-public-error-channel.good.ts).
- `no-mixed-effect-error-shapes`: [failure](errorModeling/no-mixed-effect-error-shapes.bad.ts), [repair](errorModeling/no-mixed-effect-error-shapes.good.ts).
- `no-expected-state-as-error`: [failure](errorModeling/no-expected-state-as-error.bad.ts), [repair](errorModeling/no-expected-state-as-error.good.ts).
- `no-empty-error-tag`: [failure](errorModeling/no-empty-error-tag.bad.ts), [repair](errorModeling/no-empty-error-tag.good.ts).
- `no-exception-domain-error`: [failure](errorModeling/no-exception-domain-error.bad.ts), [repair](errorModeling/no-exception-domain-error.good.ts).
- `no-log-only-error-handling`: [failure](errorModeling/no-log-only-error-handling.bad.ts), [repair](errorModeling/no-log-only-error-handling.good.ts).

## ddd

- `no-effect-fail-error-message`: [failure](../failures.ts), [repair](../valid.ts).
- `no-catchall-generic-rethrow`: [failure](../recovery-runtime/rethrow.ts), [repair](../recovery-runtime/valid.ts).
- `no-early-catchall-null`: [failure](../recovery-runtime/fallback.ts), [repair](../recovery-runtime/valid.ts).
- `no-error-as-public-effect-error`: [failure](errorModeling/no-error-as-public-effect-error.bad.ts), [repair](errorModeling/no-error-as-public-effect-error.good.ts).
- `no-unknown-public-error-channel`: [failure](errorModeling/no-unknown-public-error-channel.bad.ts), [repair](errorModeling/no-unknown-public-error-channel.good.ts).
- `no-mixed-effect-error-shapes`: [failure](errorModeling/no-mixed-effect-error-shapes.bad.ts), [repair](errorModeling/no-mixed-effect-error-shapes.good.ts).
- `no-expected-state-as-error`: [failure](errorModeling/no-expected-state-as-error.bad.ts), [repair](errorModeling/no-expected-state-as-error.good.ts).
- `no-empty-error-tag`: [failure](errorModeling/no-empty-error-tag.bad.ts), [repair](errorModeling/no-empty-error-tag.good.ts).
- `no-exception-domain-error`: [failure](errorModeling/no-exception-domain-error.bad.ts), [repair](errorModeling/no-exception-domain-error.good.ts).
- `no-log-only-error-handling`: [failure](errorModeling/no-log-only-error-handling.bad.ts), [repair](errorModeling/no-log-only-error-handling.good.ts).
- `no-raw-domain-id-alias`: [failure](domainModeling/no-raw-domain-id-alias.bad.ts), [repair](domainModeling/no-raw-domain-id-alias.good.ts).
- `no-boolean-domain-flag`: [failure](domainModeling/no-boolean-domain-flag.bad.ts), [repair](domainModeling/no-boolean-domain-flag.good.ts).
- `no-magic-domain-string`: [failure](domainModeling/no-magic-domain-string.bad.ts), [repair](domainModeling/no-magic-domain-string.good.ts).
- `no-raw-domain-primitive-params`: [failure](domainModeling/no-raw-domain-primitive-params.bad.ts), [repair](domainModeling/no-raw-domain-primitive-params.good.ts).
- `no-raw-time-domain-field`: [failure](domainModeling/no-raw-time-domain-field.bad.ts), [repair](domainModeling/no-raw-time-domain-field.good.ts).
- `no-overloaded-options-object`: [failure](domainModeling/no-overloaded-options-object.bad.ts), [repair](domainModeling/no-overloaded-options-object.good.ts).
- `no-domain-logic-in-conditional`: [failure](domainModeling/no-domain-logic-in-conditional.bad.ts), [repair](domainModeling/no-domain-logic-in-conditional.good.ts).
- `no-implicit-state-machine-object`: [failure](domainModeling/no-implicit-state-machine-object.bad.ts), [repair](domainModeling/no-implicit-state-machine-object.good.ts).
- `no-adhoc-domain-error`: [failure](domainModeling/no-adhoc-domain-error.bad.ts), [repair](domainModeling/no-adhoc-domain-error.good.ts).
- `no-domain-meaning-by-folder-only`: [failure](domainModeling/no-domain-meaning-by-folder-only.bad.ts), [repair](domainModeling/no-domain-meaning-by-folder-only.good.ts).
- `no-new-date-in-domain-logic`: [failure](domainModeling/no-new-date-in-domain-logic.bad.ts), [repair](domainModeling/no-new-date-in-domain-logic.good.ts).

## effectFlow

- `no-piped-yield-in-gen`: [failure](effectFlow/no-piped-yield-in-gen.bad.ts), [repair](effectFlow/no-piped-yield-in-gen.good.ts).
- `no-gen-for-mapping`: [failure](effectFlow/no-gen-for-mapping.bad.ts), [repair](effectFlow/no-gen-for-mapping.good.ts).
- `prefer-gen-for-workflow`: [failure](effectFlow/prefer-gen-for-workflow.bad.ts), [repair](effectFlow/prefer-gen-for-workflow.good.ts).
- `no-business-logic-in-pipe`: [failure](effectFlow/no-business-logic-in-pipe.bad.ts), [repair](effectFlow/no-business-logic-in-pipe.good.ts).

## pureTransformation

- `no-large-anonymous-flow`: [failure](pureTransformation/no-large-anonymous-flow.bad.ts), [repair](pureTransformation/no-large-anonymous-flow.good.ts).
- `no-effect-in-flow`: [failure](pureTransformation/no-effect-in-flow.bad.ts), [repair](pureTransformation/no-effect-in-flow.good.ts).
- `prefer-named-flow`: [failure](pureTransformation/prefer-named-flow.bad.ts), [repair](pureTransformation/prefer-named-flow.good.ts).
- `prefer-flow-for-pure-pipeline`: [failure](pureTransformation/prefer-flow-for-pure-pipeline.bad.ts), [repair](pureTransformation/prefer-flow-for-pure-pipeline.good.ts).

## behaviorDecoration

- `prefer-pipe-for-behavior`: [failure](behaviorDecoration/prefer-pipe-for-behavior.bad.ts), [repair](behaviorDecoration/prefer-pipe-for-behavior.good.ts).
- `prefer-decorated-effect-before-gen`: [failure](behaviorDecoration/prefer-decorated-effect-before-gen.bad.ts), [repair](behaviorDecoration/prefer-decorated-effect-before-gen.good.ts).
- `no-workflow-in-behavior-pipe`: [failure](behaviorDecoration/no-workflow-in-behavior-pipe.bad.ts), [repair](behaviorDecoration/no-workflow-in-behavior-pipe.good.ts).

## styleSeparation

- `no-mixed-pillar-function`: [failure](styleSeparation/no-mixed-pillar-function.bad.ts), [repair](styleSeparation/no-mixed-pillar-function.good.ts).
- `no-clever-effect-expression`: [failure](styleSeparation/no-clever-effect-expression.bad.ts), [repair](styleSeparation/no-clever-effect-expression.good.ts).
- `prefer-extracted-concept`: [failure](styleSeparation/prefer-extracted-concept.bad.ts), [repair](styleSeparation/prefer-extracted-concept.good.ts).

## serviceAndLayerArchitecture

- `prefer-effect-service`: [failure](serviceAndLayerArchitecture/prefer-effect-service.bad.ts), [repair](serviceAndLayerArchitecture/prefer-effect-service.good.ts).
- `no-layer-provide-in-service-definition`: [failure](serviceAndLayerArchitecture/no-layer-provide-in-service-definition.bad.ts), [repair](serviceAndLayerArchitecture/no-layer-provide-in-service-definition.good.ts).
- `no-namespace-effect-import`: [failure](serviceAndLayerArchitecture/no-namespace-effect-import.bad.ts), [repair](serviceAndLayerArchitecture/no-namespace-effect-import.good.ts).
- `no-manual-service-object-export`: [failure](serviceAndLayerArchitecture/no-manual-service-object-export.bad.ts), [repair](serviceAndLayerArchitecture/no-manual-service-object-export.good.ts).
- `no-layer-merge-in-request-handler`: [failure](serviceAndLayerArchitecture/no-layer-merge-in-request-handler.bad.ts), [repair](serviceAndLayerArchitecture/no-layer-merge-in-request-handler.good.ts).
- `no-service-method-returning-promise`: [failure](serviceAndLayerArchitecture/no-service-method-returning-promise.bad.ts), [repair](serviceAndLayerArchitecture/no-service-method-returning-promise.good.ts).
- `prefer-layer-pipe`: [failure](serviceAndLayerArchitecture/prefer-layer-pipe.bad.ts), [repair](serviceAndLayerArchitecture/prefer-layer-pipe.good.ts).
- `no-inline-layer-provide-in-program`: [failure](serviceAndLayerArchitecture/no-inline-layer-provide-in-program.bad.ts), [repair](serviceAndLayerArchitecture/no-inline-layer-provide-in-program.good.ts).
- `prefer-layer-mergeall-for-infrastructure`: [failure](serviceAndLayerArchitecture/prefer-layer-mergeall-for-infrastructure.bad.ts), [repair](serviceAndLayerArchitecture/prefer-layer-mergeall-for-infrastructure.good.ts).
- `no-service-layer-scatter`: [failure](serviceAndLayerArchitecture/no-service-layer-scatter.bad.ts), [repair](serviceAndLayerArchitecture/no-service-layer-scatter.good.ts).

## platformAndBoundaryHygiene

- `no-hidden-effect-execution`: [failure](platformAndBoundaryHygiene/no-hidden-effect-execution.bad.ts), [repair](platformAndBoundaryHygiene/no-hidden-effect-execution.good.ts).
- `no-boundary-try-catch-without-effect-map`: [failure](platformAndBoundaryHygiene/server/no-boundary-try-catch-without-effect-map.bad.ts), [repair](platformAndBoundaryHygiene/server/no-boundary-try-catch-without-effect-map.good.ts).
- `no-node-fs-in-effect-code`: [failure](platformAndBoundaryHygiene/no-node-fs-in-effect-code.bad.ts), [repair](platformAndBoundaryHygiene/no-node-fs-in-effect-code.good.ts).
- `no-json-parse-without-schema`: [failure](platformAndBoundaryHygiene/no-json-parse-without-schema.bad.ts), [repair](platformAndBoundaryHygiene/no-json-parse-without-schema.good.ts).
- `no-date-now-in-effect`: [failure](platformAndBoundaryHygiene/no-date-now-in-effect.bad.ts), [repair](platformAndBoundaryHygiene/no-date-now-in-effect.good.ts).
- `no-node-platform-in-shared-code`: [failure](platformAndBoundaryHygiene/no-node-platform-in-shared-code.bad.ts), [repair](platformAndBoundaryHygiene/no-node-platform-in-shared-code.good.ts).
- `no-process-env-direct-read`: [failure](platformAndBoundaryHygiene/no-process-env-direct-read.bad.ts), [repair](platformAndBoundaryHygiene/no-process-env-direct-read.good.ts).

## testingObservabilityAndQa

- `no-console-in-effect-flow`: [failure](testingObservabilityAndQa/no-console-in-effect-flow.bad.ts), [repair](testingObservabilityAndQa/no-console-in-effect-flow.good.ts).
- `no-effect-log-without-structured-context`: [failure](testingObservabilityAndQa/no-effect-log-without-structured-context.bad.ts), [repair](testingObservabilityAndQa/no-effect-log-without-structured-context.good.ts).
- `require-span-on-public-service-method`: [failure](testingObservabilityAndQa/require-span-on-public-service-method.bad.ts), [repair](testingObservabilityAndQa/require-span-on-public-service-method.good.ts).
- `no-runpromise-in-non-async-test-body`: [failure](testingObservabilityAndQa/no-runpromise-in-non-async-test-body.bad.test.ts), [repair](testingObservabilityAndQa/no-runpromise-in-non-async-test-body.good.test.ts).
- `require-effect-flip-for-error-test`: [failure](testingObservabilityAndQa/require-effect-flip-for-error-test.bad.test.ts), [repair](testingObservabilityAndQa/require-effect-flip-for-error-test.good.test.ts).
- `no-test-mock-layer-when-default-available`: [failure](testingObservabilityAndQa/no-test-mock-layer-when-default-available.bad.test.ts), [repair](testingObservabilityAndQa/no-test-mock-layer-when-default-available.good.test.ts).
