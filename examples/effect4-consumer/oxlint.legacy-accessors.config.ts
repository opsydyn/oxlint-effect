import { defineConfig } from "oxlint";
import { jsPlugins } from "@opsydyn/oxlint-effect";

export default defineConfig({
  categories: { correctness: "off" },
  jsPlugins: [...jsPlugins],
  rules: { "linteffect/require-service-accessors": ["error", { effectVersion: 4 }] },
});
