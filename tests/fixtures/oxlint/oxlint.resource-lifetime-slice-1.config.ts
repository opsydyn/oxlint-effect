import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-manual-resource-close": ["error", { effectVersion: 3 }],
    "linteffect/no-unbound-scope": ["error", { effectVersion: 3 }],
    "linteffect/no-resource-succeed-escape": ["error", { effectVersion: 3 }],
  },
});
