import { defineConfig } from "oxlint";
import { effect3, type typeAware } from "@opsydyn/oxlint-effect";

export function configFor(preset: typeof typeAware | typeof effect3.typeAware) {
  return defineConfig({
    options: preset.options,
    env: { builtin: true },
    jsPlugins: [...preset.jsPlugins],
    plugins: ["typescript", "unicorn", "oxc"],
    rules: {
      ...preset.rules,
      "typescript/no-floating-promises": "error",
      "typescript/no-misused-promises": "error",
    },
  });
}

export default configFor(effect3.typeAware);
