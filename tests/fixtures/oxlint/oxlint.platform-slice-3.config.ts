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
    "linteffect/no-new-date-in-domain-logic": "error",
    "linteffect/no-boundary-try-catch-without-effect-map": "error",
  },
});
