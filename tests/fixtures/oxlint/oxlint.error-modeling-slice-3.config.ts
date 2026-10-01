import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-early-catchall-null": ["error", { effectVersion: 3 }],
    "linteffect/no-expected-state-as-error": "error",
    "linteffect/no-exception-domain-error": ["error", { effectVersion: 3 }],
  },
});
