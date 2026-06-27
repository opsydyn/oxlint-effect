import { defineConfig } from "oxlint";
import { allRules } from "../src/index.ts";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [
    {
      name: "linteffect",
      specifier: "../src/index.ts",
    },
  ],
  rules: allRules,
});
