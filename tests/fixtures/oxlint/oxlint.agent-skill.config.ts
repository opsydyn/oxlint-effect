import { defineConfig } from "oxlint";
import { dddRules } from "../../../src/index.ts";

export default defineConfig({
  jsPlugins: [{ name: "linteffect", specifier: "../../../src/index.ts" }],
  rules: dddRules,
});
