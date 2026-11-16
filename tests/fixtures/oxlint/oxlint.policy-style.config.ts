import { defineConfig } from "oxlint";

export default defineConfig({
  categories: { correctness: "off" },
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-effect-fn-generator": ["error", { effectVersion: 4 }],
    "linteffect/no-manual-effect-channels": "error",
    "linteffect/no-effect-type-alias": "error",
  },
});
