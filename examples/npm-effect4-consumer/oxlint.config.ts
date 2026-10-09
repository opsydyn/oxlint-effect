import { defineConfig } from "oxlint";
import { ddd } from "@opsydyn/oxlint-effect";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [...ddd.jsPlugins],
  rules: ddd.rules,
});
