import { defineConfig } from "oxlint";
import { jsPlugins } from "@opsydyn/oxlint-effect";
export default defineConfig({
  categories: { correctness: "off" }, jsPlugins: [...jsPlugins],
  rules: {
    "linteffect/no-fire-and-forget-fork": ["error", { effectVersion: 4 }],
    "linteffect/no-fork-in-loop": ["error", { effectVersion: 4 }],
  },
});
