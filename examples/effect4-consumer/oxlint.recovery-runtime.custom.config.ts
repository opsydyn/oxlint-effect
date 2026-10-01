import { defineConfig } from "oxlint";
import base from "./oxlint.recovery-runtime.config.ts";
export default defineConfig({
  ...base,
  overrides: [
    ...(base.overrides ?? []),
    {
      files: ["src/recovery-runtime/main.ts", "src/recovery-runtime/custom-entry.ts"],
      rules: {
        "linteffect/no-early-catchall-null": ["error", { effectVersion: 4, boundaryPaths: ["**/custom-entry.ts"] }],
        "linteffect/no-run-effect-outside-boundary": ["error", { effectVersion: 4, boundaryPaths: ["**/custom-entry.ts"] }],
      },
    },
  ],
});
