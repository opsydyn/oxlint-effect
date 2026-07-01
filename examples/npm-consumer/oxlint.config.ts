import { defineConfig } from "oxlint";
import { recommended } from "@opsydyn/oxlint-effect";

export default defineConfig({
  categories: {
    correctness: "error",
  },
  env: {
    builtin: true,
  },
  jsPlugins: [...recommended.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  overrides: [
    {
      files: ["test/**/*.ts"],
      rules: {
        "linteffect/no-run-effect-outside-boundary": "off",
      },
    },
  ],
  rules: {
    "linteffect/no-inline-runtime-provide": "error",
    "linteffect/no-or-die-outside-boundary": "error",
    "linteffect/no-react-state": "error",
    "linteffect/no-render-side-effects": "error",
    "linteffect/no-run-effect-outside-boundary": "error",
    "linteffect/no-runtime-runfork": "error",
    "linteffect/no-try-catch-in-effect-logic": "error",
    "linteffect/prevent-dynamic-imports": "error",
  },
});
