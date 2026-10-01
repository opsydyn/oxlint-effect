import { defineConfig } from "oxlint";
import { jsPlugins } from "@opsydyn/oxlint-effect";
export default defineConfig({
  categories: { correctness: "off" },
  jsPlugins: [...jsPlugins],
  rules: {
    "linteffect/no-catchall-generic-rethrow": ["error", { effectVersion: 3 }],
    "linteffect/no-early-catchall-null": ["error", { effectVersion: 3 }],
    "linteffect/no-run-effect-outside-boundary": ["error", { effectVersion: 3 }],
  },
  overrides: [
    {
      files: ["src/recovery-runtime/contracts.ts"],
      rules: {
        "linteffect/no-run-effect-outside-boundary": ["error", { effectVersion: 3, boundaryPaths: ["**/contracts.ts"] }],
      },
    },
    {
      files: ["src/recovery-runtime/custom-entry.ts"],
      rules: {
        "linteffect/no-early-catchall-null": ["error", { effectVersion: 3, boundaryPaths: ["**/custom-entry.ts"] }],
        "linteffect/no-run-effect-outside-boundary": ["error", { effectVersion: 3, boundaryPaths: ["**/custom-entry.ts"] }],
      },
    },
    {
      files: ["src/recovery-runtime/mixed-other.ts"],
      rules: {
        "linteffect/no-catchall-generic-rethrow": ["error", { effectVersion: 4 }],
        "linteffect/no-early-catchall-null": ["error", { effectVersion: 4 }],
      },
    },
  ],
});
