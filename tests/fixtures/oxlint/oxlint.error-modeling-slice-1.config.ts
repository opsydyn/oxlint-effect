import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: {
    "linteffect/no-error-as-public-effect-error": "error",
    "linteffect/no-unknown-public-error-channel": "error",
    "linteffect/no-mixed-effect-error-shapes": "error",
  },
});
