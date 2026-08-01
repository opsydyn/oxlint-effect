import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [
    {
      name: "linteffect",
      specifier: "../../../src/index.ts",
    },
  ],
  rules: {
    "linteffect/no-yield-with-held-semaphore-permit": "error",
    "linteffect/no-yield-with-held-mutable-ref": "error",
    "linteffect/no-unscoped-background-fiber": "error",
  },
});
