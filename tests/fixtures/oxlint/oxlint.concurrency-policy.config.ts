import { defineConfig } from "oxlint";

export default defineConfig({
  categories: { correctness: "off" },
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-unbounded-effect-all": "error",
    "linteffect/no-unbounded-concurrent-retry": "error",
  },
});
