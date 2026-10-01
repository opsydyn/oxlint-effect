import { defineConfig } from "oxlint";
import { effect3 } from "../../../src/index.ts";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [
    {
      name: "linteffect",
      specifier: "../../../src/index.ts",
    },
  ],
  rules: effect3.testingObservabilityAndQaRules,
});
