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
    "linteffect/no-console-in-effect-flow": "error",
    "linteffect/no-effect-log-without-structured-context": "error",
    "linteffect/require-span-on-public-service-method": "error",
  },
});
