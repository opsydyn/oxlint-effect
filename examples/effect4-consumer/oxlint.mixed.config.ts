import { defineConfig } from "oxlint";
import { jsPlugins } from "@opsydyn/oxlint-effect";

export default defineConfig({
  categories: { correctness: "off" },
  jsPlugins: [...jsPlugins],
  overrides: [
    { files: ["src/mixed/effect3*.ts"], rules: { "linteffect/no-hidden-effect-execution": ["error", { effectVersion: 3, boundaryPaths: ["src/mixed/effect3-boundary.ts"] }] } },
    { files: ["src/mixed/effect4*.ts"], rules: { "linteffect/no-hidden-effect-execution": ["error", { effectVersion: 4, boundaryPaths: ["src/mixed/effect4-boundary.ts"] }] } },
  ],
});
