import { defineConfig } from "oxlint";
import { jsPlugins } from "@opsydyn/oxlint-effect";
export default defineConfig({
  categories: { correctness: "off" }, jsPlugins: [...jsPlugins],
  rules: {
    "linteffect/no-fire-and-forget-fork": ["error", { effectVersion: 3 }],
    "linteffect/no-fork-in-loop": ["error", { effectVersion: 3 }],
    "linteffect/no-race-without-cleanup": ["error", { effectVersion: 3 }],
    "linteffect/no-unobserved-fiber": ["error", { effectVersion: 3 }],
  },
});
