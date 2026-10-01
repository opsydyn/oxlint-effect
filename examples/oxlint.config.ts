import { defineConfig } from "oxlint";
import { effect3 } from "../src/index.ts";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [
    {
      name: "linteffect",
      specifier: "../src/index.ts",
    },
  ],
  rules: {
    ...effect3.allRules,
    "linteffect/no-boundary-try-catch-without-effect-map": [
      "error",
      { effectVersion: 3, boundaryPaths: ["examples/backend/platform-boundary-hygiene-anti-patterns.ts"] },
    ],
  },
});
