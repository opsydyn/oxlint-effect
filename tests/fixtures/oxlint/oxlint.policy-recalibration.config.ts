import { defineConfig } from "oxlint";
import { recommended } from "../../../src/index.ts";

export default defineConfig({
  categories: { correctness: "off" },
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: recommended.rules,
});
