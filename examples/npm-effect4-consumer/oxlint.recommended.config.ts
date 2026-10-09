import { defineConfig } from "oxlint";
import { recommended } from "@opsydyn/oxlint-effect";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [...recommended.jsPlugins],
  rules: recommended.rules,
});
