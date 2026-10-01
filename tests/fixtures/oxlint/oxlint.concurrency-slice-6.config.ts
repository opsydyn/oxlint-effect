import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [
    {
      name: "linteffect",
      specifier: "../../../src/index.ts",
    },
  ],
  rules: {
    "linteffect/no-yield-with-held-semaphore-permit": ["error", { effectVersion: 3 }],
    "linteffect/no-yield-with-held-mutable-ref": ["error", { effectVersion: 3 }],
    "linteffect/no-unscoped-background-fiber": ["error", { effectVersion: 3 }],
  },
});
