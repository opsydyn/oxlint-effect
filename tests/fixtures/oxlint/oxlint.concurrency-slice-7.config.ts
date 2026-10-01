import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [
    {
      name: "linteffect",
      specifier: "../../../src/index.ts",
    },
  ],
  rules: {
    "linteffect/no-manual-deferred-coordination": ["error", { effectVersion: 3 }],
    "linteffect/no-acquire-without-scoped-release": ["error", { effectVersion: 3 }],
  },
});
