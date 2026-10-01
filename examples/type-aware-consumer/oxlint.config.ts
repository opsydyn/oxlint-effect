import { defineConfig } from "oxlint";
import { effect3 } from "@opsydyn/oxlint-effect";

const { typeAware } = effect3;

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
