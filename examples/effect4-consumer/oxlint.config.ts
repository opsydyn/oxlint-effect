import { defineConfig } from "oxlint";
import { jsPlugins } from "@opsydyn/oxlint-effect";

export default defineConfig({
  categories: { correctness: "off" },
  jsPlugins: [...jsPlugins],
  rules: { "linteffect/no-effect-fail-error-message": "error" },
});
