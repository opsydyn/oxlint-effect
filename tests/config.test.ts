import { describe, expect, it } from "bun:test";
import plugin, { allRules, recommended } from "../src/index";

describe("linteffect config exports", () => {
  it("exports a recommended config with plugin loading and enabled rules", () => {
    expect(recommended.jsPlugins).toEqual([
      {
        name: "linteffect",
        specifier: "@opsydyn/oxlint-effect",
      },
    ]);

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
});
