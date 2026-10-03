import { defineConfig } from "oxlint";
import * as current from "@opsydyn/oxlint-effect";
import { customConfig } from "./config-contract";
const policy = current;
const groupNames = [
  "reactAndRuntimeBoundaries",
  "effectComposition",
  "concurrencySafety",
  "resourceLifetime",
  "pipelineShapeAndSequencing",
  "branchingAndLocalControlFlow",
  "optionMatchAndDataNormalization",
  "atomStateAndPlatformBoundaries",
  "domainModeling",
  "errorModeling",
  "ddd",
  "effectFlow",
  "pureTransformation",
  "behaviorDecoration",
  "styleSeparation",
  "serviceAndLayerArchitecture",
  "platformAndBoundaryHygiene",
  "testingObservabilityAndQa"
] as const;
const expectedDdd = [
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
  "no-new-date-in-domain-logic",
  "no-error-as-public-effect-error",
  "no-unknown-public-error-channel",
  "no-mixed-effect-error-shapes",
  "no-expected-state-as-error",
  "no-early-catchall-null",
  "no-empty-error-tag",
  "no-exception-domain-error",
  "no-effect-fail-error-message",
  "no-catchall-generic-rethrow",
  "no-log-only-error-handling"
].map(id => `linteffect/${id}`).sort();
const excluded = [
  "no-runpromise-in-non-async-test-body",
  "require-effect-flip-for-error-test",
  "no-test-mock-layer-when-default-available",
  "no-business-logic-in-pipe",
  "prefer-flow-for-pure-pipeline",
  "no-early-catchall-null",
  "no-empty-error-tag",
  "no-expected-state-as-error",
  "no-error-as-public-effect-error",
  "no-unknown-public-error-channel",
  "no-mixed-effect-error-shapes",
  "no-manual-deferred-coordination",
  "no-resource-succeed-escape",
  "no-request-scoped-long-lived-resource",
  "no-global-resource-singleton",
  "no-nested-acquire-release",
  "no-missing-layer-provision-at-run",
  "no-yield-with-held-semaphore-permit",
  "no-yield-with-held-mutable-ref",
  "no-unscoped-background-fiber"
].map(id => `linteffect/${id}`);
const legacyOnly = ["require-service-accessors", "require-service-dependencies", "no-effect-async", "no-effect-orElse-ladder", "no-runtime-runfork"];
const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const keys = (value: object) => Object.keys(value).sort();
export const groupConfigs = groupNames.map(name => {
  const preset = policy[name]; const companion = policy[`${name}Rules`];
  if (!same(preset.rules, companion) || !same(preset.rules, policy.ruleGroups[name])) throw new Error(`Group companion mismatch: ${name}`);
  return defineConfig({ jsPlugins: [...preset.jsPlugins], rules: companion });
});
export const presetConfigs = Object.entries(policy.presets).map(([name, preset]) => {
  if (name === "typeAware") return defineConfig({ options: policy.typeAware.options, jsPlugins: [...preset.jsPlugins], rules: preset.rules });
  return defineConfig({ jsPlugins: [...preset.jsPlugins], rules: preset.rules });
});
export const allConfig = defineConfig({ jsPlugins: [...policy.jsPlugins], rules: policy.allRules });
export const recommendedOnly = defineConfig({ jsPlugins: [...policy.jsPlugins], rules: policy.recommendedRules });
if (expectedDdd.length !== 21 || !same(keys(policy.dddRules), expectedDdd) || !same(keys(policy.dddRules), keys({ ...policy.domainModelingRules, ...policy.errorModelingRules }))) throw new Error("DDD must be the exact 21-member union");
for (const [id, entry] of Object.entries(policy.allRules)) {
  if (Array.isArray(entry) && entry[1].effectVersion !== 4) throw new Error(`Wrong major in ${id}`);
  if (excluded.includes(id) === Object.hasOwn(policy.recommendedRules, id)) throw new Error(`Recommended exclusion mismatch: ${id}`);
}
for (const id of legacyOnly) {
  if (Object.hasOwn(current.allRules, `linteffect/${id}`) || !Object.hasOwn(current.effect3.allRules, `linteffect/${id}`) || !Object.hasOwn(current.default.rules, id)) throw new Error(`Legacy-only registration mismatch: ${id}`);
}
if (!same(policy.typeAware.rules, policy.recommendedRules) || policy.typeAware.options.typeAware !== true || "options" in policy.recommended) throw new Error("Type-aware opt-in changed");
const custom = customConfig.rules?.["linteffect/no-early-catchall-null"];
if (!same(custom, ["warn", { effectVersion: 4, boundaryPaths: ["src/http/**"] }])) throw new Error("Boundary/version override lost");
export const retained = defineConfig({ jsPlugins: [...policy.jsPlugins], rules: { ...policy.platformAndBoundaryHygieneRules, "linteffect/no-process-env-direct-read": ["warn", { effectVersion: 4, boundaryPaths: ["src/http/**"], configPaths: ["src/settings/**"] }] } });
if (!same(retained.rules?.["linteffect/no-process-env-direct-read"], ["warn", { effectVersion: 4, boundaryPaths: ["src/http/**"], configPaths: ["src/settings/**"] }])) throw new Error("Custom path options lost");
// Both maps coexist in this process; policy selection is local, not global mutable state.
if (!same(current.recommendedRules["linteffect/no-wrapgraphql-catchall"], ["error", { effectVersion: 4 }]) || !same(current.effect3.recommendedRules["linteffect/no-wrapgraphql-catchall"], ["error", { effectVersion: 3 }])) throw new Error("Mixed-major composition leaked");
