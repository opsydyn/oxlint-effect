import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-manual-resource-close": "error",
    "linteffect/no-unbound-scope": "error",
    "linteffect/no-resource-succeed-escape": "error",
  },
});
