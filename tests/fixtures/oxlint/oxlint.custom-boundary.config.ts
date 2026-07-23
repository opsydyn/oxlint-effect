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
    "linteffect/no-node-platform-in-shared-code": ["error", { boundaryPaths: ["custom-boundary/**"] }],
    "linteffect/no-process-env-direct-read": ["error", { boundaryPaths: ["custom-boundary/**"], configPaths: ["custom-boundary/**"] }],
    "linteffect/no-hidden-effect-execution": ["error", { boundaryPaths: ["custom-boundary/**"] }],
  },
});
