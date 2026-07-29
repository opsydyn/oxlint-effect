import { defineConfig } from "oxlint";
import { testingObservabilityAndQaRules } from "../../../src/index.ts";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [
    {
      name: "linteffect",
      specifier: "../../../src/index.ts",
    },
  ],
  rules: testingObservabilityAndQaRules,
});
