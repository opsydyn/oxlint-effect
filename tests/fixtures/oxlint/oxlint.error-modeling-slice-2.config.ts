import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-effect-fail-error-message": "error",
    "linteffect/no-catchall-generic-rethrow": "error",
    "linteffect/no-log-only-error-handling": "error",
  },
});
