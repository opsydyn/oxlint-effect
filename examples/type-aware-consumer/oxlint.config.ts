import { defineConfig } from "oxlint";
import { typeAware } from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  env: { builtin: true },
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  rules: {
    ...typeAware.rules,
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
  },
});
