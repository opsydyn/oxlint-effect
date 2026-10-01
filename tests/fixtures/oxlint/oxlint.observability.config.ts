import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [
    {
      name: "linteffect",
      specifier: "../../../src/index.ts",
    },
  ],
  rules: {
    "linteffect/no-console-in-effect-flow": ["error", { effectVersion: 3 }],
    "linteffect/no-effect-log-without-structured-context": ["error", { effectVersion: 3 }],
    "linteffect/require-span-on-public-service-method": ["error", { effectVersion: 3 }],
  },
});
