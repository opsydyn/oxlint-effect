import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-request-scoped-long-lived-resource": "error",
    "linteffect/no-global-resource-singleton": "error",
    "linteffect/no-run-with-open-resource": "error",
  },
});
