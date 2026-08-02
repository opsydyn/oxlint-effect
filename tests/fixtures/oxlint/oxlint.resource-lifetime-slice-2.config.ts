import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-resource-without-acquire-release": "error",
    "linteffect/no-nested-acquire-release": "error",
  },
});
