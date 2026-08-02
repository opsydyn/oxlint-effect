import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-empty-error-tag": "error",
  },
});
