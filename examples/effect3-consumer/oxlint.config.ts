import { defineConfig } from "oxlint";
import { effect3 } from "@opsydyn/oxlint-effect";
const { jsPlugins } = effect3;

export default defineConfig({
  categories: { correctness: "off" },
  jsPlugins: [...jsPlugins],
  rules: { "linteffect/no-effect-fail-error-message": "error" },
});
