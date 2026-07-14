import { describe, expect, it } from "bun:test";
import plugin, {
  allRules,
  atomStateAndPlatformBoundaries,
  atomStateAndPlatformBoundariesRules,
  behaviorDecoration,
  behaviorDecorationRules,
  branchingAndLocalControlFlow,
  branchingAndLocalControlFlowRules,
  concurrencySafety,
  concurrencySafetyRules,
  ddd,
  domainModeling,
  domainModelingRules,
  effectFlow,
  effectFlowRules,
  effectComposition,
  effectCompositionRules,
  optionMatchAndDataNormalization,
  optionMatchAndDataNormalizationRules,
  pipelineShapeAndSequencing,
  pipelineShapeAndSequencingRules,
  pureTransformation,
  pureTransformationRules,
  presets,
  reactAndRuntimeBoundaries,
  reactAndRuntimeBoundariesRules,
  recommended,
  ruleGroups,
  serviceAndLayerArchitecture,
  serviceAndLayerArchitectureRules,
  styleSeparation,
  styleSeparationRules,
} from "../src/index";

const expectedJsPlugins = [
  {
    name: "linteffect",
    specifier: "@opsydyn/oxlint-effect",
  },
] as const;

type ComparableRules = Record<string, "error">;

const rulesFor = (ruleNames: string[]) => Object.fromEntries(
  ruleNames.map((ruleName) => [`linteffect/${ruleName}`, "error"]),
) as ComparableRules;

const groupExpectations = {
  reactAndRuntimeBoundaries: [
    "no-react-state",
    "no-runtime-runfork",
    "no-run-effect-outside-boundary",
    "no-or-die-outside-boundary",
    "prevent-dynamic-imports",
    "no-render-side-effects",
    "no-inline-runtime-provide",
  ],
  effectComposition: [
    "no-effect-as",
    "no-effect-do",
    "no-effect-bind",
    "no-effect-async",
    "no-effect-ignore",
    "no-effect-never",
    "no-effect-fn-generator",
    "no-nested-effect-gen",
    "no-yield-without-star-in-effect-gen",
    "no-async-effect-combinator-callback",
    "no-throw-in-effect-logic",
    "no-try-catch-in-effect-logic",
    "no-promise-api-in-effect-logic",
    "no-swallowed-catch-all",
    "no-manual-effect-channels",
    "no-effect-type-alias",
    "no-public-generic-effect-error",
  ],
  concurrencySafety: [
    "no-unbounded-effect-all",
    "no-fire-and-forget-fork",
    "no-fork-in-loop",
    "no-race-without-cleanup",
    "no-unobserved-fiber",
    "no-unbounded-concurrent-retry",
    "no-blocking-call-in-effect",
    "no-promise-concurrency-in-effect",
    "no-shared-mutable-state-across-fibers",
    "no-timeout-with-noninterruptible-promise",
    "no-uninterruptible-concurrent-region",
    "no-unbounded-queue-or-pubsub",
    "no-global-mutable-concurrency-state",
  ],
  pipelineShapeAndSequencing: [
    "no-nested-effect-call",
    "no-effect-ladder",
    "no-flatmap-ladder",
    "no-pipe-ladder",
    "no-call-tower",
    "no-effect-orElse-ladder",
    "no-effect-wrapper-alias",
    "warn-effect-sync-wrapper",
    "no-effect-side-effect-wrapper",
    "no-effect-all-step-sequencing",
    "no-effect-succeed-variable",
  ],
  branchingAndLocalControlFlow: [
    "no-if-statement",
    "no-switch-statement",
    "no-ternary",
    "no-try-catch",
    "no-arrow-ladder",
    "no-iife-wrapper",
    "no-return-in-arrow",
    "no-return-in-callback",
    "no-return-null",
    "no-branch-in-object",
  ],
  optionMatchAndDataNormalization: [
    "no-option-as",
    "no-match-void-branch",
    "no-match-effect-branch",
    "no-model-overlay-cast",
    "no-unknown-boolean-coercion-helper",
    "no-fromnullable-nullish-coalesce",
    "no-option-boolean-normalization",
    "no-string-sentinel-return",
    "no-string-sentinel-const",
  ],
  atomStateAndPlatformBoundaries: [
    "no-effect-sync-console",
    "no-atom-registry-effect-sync",
    "no-family-collection-read",
    "no-naked-object-state-update",
    "no-wrapgraphql-catchall",
  ],
  domainModeling: [
    "no-raw-domain-id-alias",
    "no-boolean-domain-flag",
    "no-magic-domain-string",
    "no-raw-domain-primitive-params",
    "no-raw-time-domain-field",
    "no-overloaded-options-object",
    "no-domain-logic-in-conditional",
    "no-implicit-state-machine-object",
    "no-adhoc-domain-error",
    "no-domain-meaning-by-folder-only",
  ],
  effectFlow: [
    "no-piped-yield-in-gen",
    "no-gen-for-mapping",
    "prefer-gen-for-workflow",
  ],
  pureTransformation: [
    "no-large-anonymous-flow",
    "no-effect-in-flow",
    "prefer-named-flow",
  ],
  behaviorDecoration: [
    "prefer-pipe-for-behavior",
    "prefer-decorated-effect-before-gen",
    "no-workflow-in-behavior-pipe",
  ],
  styleSeparation: [
    "no-mixed-pillar-function",
    "no-clever-effect-expression",
    "prefer-extracted-concept",
  ],
  serviceAndLayerArchitecture: [
    "prefer-effect-service",
    "no-layer-provide-in-service-definition",
    "require-service-accessors",
    "require-service-dependencies",
    "no-namespace-effect-import",
    "no-manual-service-object-export",
    "no-layer-merge-in-request-handler",
    "no-service-method-returning-promise",
    "prefer-layer-pipe",
    "no-inline-layer-provide-in-program",
    "prefer-layer-mergeall-for-infrastructure",
  ],
} as const;

const exportedRuleGroups = {
  reactAndRuntimeBoundaries: reactAndRuntimeBoundariesRules,
  effectComposition: effectCompositionRules,
  concurrencySafety: concurrencySafetyRules,
  pipelineShapeAndSequencing: pipelineShapeAndSequencingRules,
  branchingAndLocalControlFlow: branchingAndLocalControlFlowRules,
  optionMatchAndDataNormalization: optionMatchAndDataNormalizationRules,
  atomStateAndPlatformBoundaries: atomStateAndPlatformBoundariesRules,
  domainModeling: domainModelingRules,
  effectFlow: effectFlowRules,
  pureTransformation: pureTransformationRules,
  behaviorDecoration: behaviorDecorationRules,
  styleSeparation: styleSeparationRules,
  serviceAndLayerArchitecture: serviceAndLayerArchitectureRules,
} as const;

const exportedPresets = {
  reactAndRuntimeBoundaries,
  effectComposition,
  concurrencySafety,
  pipelineShapeAndSequencing,
  branchingAndLocalControlFlow,
  optionMatchAndDataNormalization,
  atomStateAndPlatformBoundaries,
  domainModeling,
  effectFlow,
  pureTransformation,
  behaviorDecoration,
  styleSeparation,
  serviceAndLayerArchitecture,
} as const;

describe("linteffect config exports", () => {
  it("exports a recommended config with plugin loading and enabled rules", () => {
    expect(recommended.jsPlugins as unknown).toEqual(expectedJsPlugins);

    expect(recommended.rules).toEqual({
      "linteffect/no-react-state": "error",
      "linteffect/no-if-statement": "error",
      "linteffect/no-switch-statement": "error",
      "linteffect/no-effect-as": "error",
      "linteffect/no-effect-do": "error",
      "linteffect/no-effect-bind": "error",
      "linteffect/no-runtime-runfork": "error",
      "linteffect/no-effect-async": "error",
      "linteffect/prevent-dynamic-imports": "error",
      "linteffect/no-nested-effect-call": "error",
      "linteffect/no-effect-ladder": "error",
      "linteffect/no-flatmap-ladder": "error",
      "linteffect/no-pipe-ladder": "error",
      "linteffect/no-call-tower": "error",
      "linteffect/no-effect-orElse-ladder": "error",
      "linteffect/no-ternary": "error",
      "linteffect/no-return-null": "error",
      "linteffect/no-option-as": "error",
      "linteffect/no-effect-never": "error",
      "linteffect/no-arrow-ladder": "error",
      "linteffect/no-branch-in-object": "error",
      "linteffect/no-iife-wrapper": "error",
      "linteffect/no-return-in-arrow": "error",
      "linteffect/no-return-in-callback": "error",
      "linteffect/no-effect-fn-generator": "error",
      "linteffect/no-effect-sync-console": "error",
      "linteffect/no-nested-effect-gen": "error",
      "linteffect/no-match-void-branch": "error",
      "linteffect/no-match-effect-branch": "error",
      "linteffect/warn-effect-sync-wrapper": "error",
      "linteffect/no-effect-side-effect-wrapper": "error",
      "linteffect/no-effect-all-step-sequencing": "error",
      "linteffect/no-try-catch": "error",
      "linteffect/no-effect-wrapper-alias": "error",
      "linteffect/no-manual-effect-channels": "error",
      "linteffect/no-wrapgraphql-catchall": "error",
      "linteffect/no-render-side-effects": "error",
      "linteffect/no-atom-registry-effect-sync": "error",
      "linteffect/no-family-collection-read": "error",
      "linteffect/no-inline-runtime-provide": "error",
      "linteffect/no-naked-object-state-update": "error",
      "linteffect/no-effect-succeed-variable": "error",
      "linteffect/no-effect-type-alias": "error",
      "linteffect/no-model-overlay-cast": "error",
      "linteffect/no-unknown-boolean-coercion-helper": "error",
      "linteffect/no-fromnullable-nullish-coalesce": "error",
      "linteffect/no-option-boolean-normalization": "error",
      "linteffect/no-string-sentinel-return": "error",
      "linteffect/no-string-sentinel-const": "error",
      "linteffect/no-raw-domain-id-alias": "error",
      "linteffect/no-boolean-domain-flag": "error",
      "linteffect/no-magic-domain-string": "error",
      "linteffect/no-raw-domain-primitive-params": "error",
      "linteffect/no-raw-time-domain-field": "error",
      "linteffect/no-overloaded-options-object": "error",
      "linteffect/no-domain-logic-in-conditional": "error",
      "linteffect/no-implicit-state-machine-object": "error",
      "linteffect/no-adhoc-domain-error": "error",
      "linteffect/no-domain-meaning-by-folder-only": "error",
      "linteffect/no-yield-without-star-in-effect-gen": "error",
      "linteffect/no-async-effect-combinator-callback": "error",
      "linteffect/no-run-effect-outside-boundary": "error",
      "linteffect/no-throw-in-effect-logic": "error",
      "linteffect/no-or-die-outside-boundary": "error",
      "linteffect/no-swallowed-catch-all": "error",
      "linteffect/no-effect-ignore": "error",
      "linteffect/no-try-catch-in-effect-logic": "error",
      "linteffect/no-promise-api-in-effect-logic": "error",
      "linteffect/no-public-generic-effect-error": "error",
      "linteffect/no-unbounded-effect-all": "error",
      "linteffect/no-fire-and-forget-fork": "error",
      "linteffect/no-fork-in-loop": "error",
      "linteffect/no-race-without-cleanup": "error",
      "linteffect/no-unobserved-fiber": "error",
      "linteffect/no-unbounded-concurrent-retry": "error",
      "linteffect/no-blocking-call-in-effect": "error",
      "linteffect/no-promise-concurrency-in-effect": "error",
      "linteffect/no-shared-mutable-state-across-fibers": "error",
      "linteffect/no-timeout-with-noninterruptible-promise": "error",
      "linteffect/no-uninterruptible-concurrent-region": "error",
      "linteffect/no-unbounded-queue-or-pubsub": "error",
      "linteffect/no-global-mutable-concurrency-state": "error",
      "linteffect/no-piped-yield-in-gen": "error",
      "linteffect/no-gen-for-mapping": "error",
      "linteffect/prefer-gen-for-workflow": "error",
      "linteffect/no-large-anonymous-flow": "error",
      "linteffect/no-effect-in-flow": "error",
      "linteffect/prefer-named-flow": "error",
      "linteffect/prefer-pipe-for-behavior": "error",
      "linteffect/prefer-decorated-effect-before-gen": "error",
      "linteffect/no-workflow-in-behavior-pipe": "error",
      "linteffect/no-mixed-pillar-function": "error",
      "linteffect/no-clever-effect-expression": "error",
      "linteffect/prefer-extracted-concept": "error",
      "linteffect/prefer-effect-service": "error",
      "linteffect/no-layer-provide-in-service-definition": "error",
      "linteffect/require-service-accessors": "error",
      "linteffect/require-service-dependencies": "error",
      "linteffect/no-namespace-effect-import": "error",
      "linteffect/no-manual-service-object-export": "error",
      "linteffect/no-layer-merge-in-request-handler": "error",
      "linteffect/no-service-method-returning-promise": "error",
      "linteffect/prefer-layer-pipe": "error",
      "linteffect/no-inline-layer-provide-in-program": "error",
      "linteffect/prefer-layer-mergeall-for-infrastructure": "error",
    });
  });

  it("keeps the allRules export aligned with plugin rules", () => {
    expect(Object.keys(allRules).sort()).toEqual(
      Object.keys(plugin.rules)
        .map((ruleName) => `linteffect/${ruleName}`)
        .sort(),
    );
    expect(Object.values(allRules).every((severity) => severity === "error")).toBe(true);
  });

  it("exports named rule groups for every documented README group", () => {
    for (const [groupName, ruleNames] of Object.entries(groupExpectations)) {
      expect(exportedRuleGroups[groupName as keyof typeof exportedRuleGroups] as ComparableRules).toEqual(
        rulesFor([...ruleNames]),
      );
    }

    expect(ruleGroups).toEqual({
      ...exportedRuleGroups,
      ddd: domainModelingRules,
    });
  });

  it("exports config-shaped presets for every rule group", () => {
    for (const [groupName, groupPreset] of Object.entries(exportedPresets)) {
      expect(groupPreset.jsPlugins as unknown).toEqual(expectedJsPlugins);
      expect(groupPreset.rules as ComparableRules).toEqual(
        exportedRuleGroups[groupName as keyof typeof exportedRuleGroups] as ComparableRules,
      );
    }

    expect(ddd).toBe(domainModeling);
    expect(presets).toEqual({
      recommended,
      ...exportedPresets,
      ddd: domainModeling,
    });
  });
});
