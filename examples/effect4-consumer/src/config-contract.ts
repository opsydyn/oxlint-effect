import { defineConfig } from "oxlint";
import { recommended, ddd, dddRules, typeAware } from "@opsydyn/oxlint-effect";
import type { EffectRuleOptions } from "@opsydyn/oxlint-effect";

export const recommendedConfig = defineConfig({ jsPlugins: [...recommended.jsPlugins], rules: recommended.rules });
export const domainConfig = defineConfig({ jsPlugins: [...ddd.jsPlugins], rules: ddd.rules });
export const customConfig = defineConfig({
  jsPlugins: [...ddd.jsPlugins],
  rules: {
    ...dddRules,
    "linteffect/no-early-catchall-null": ["warn", { effectVersion: 4, boundaryPaths: ["src/http/**"] }],
  },
});
export const typedConfig = defineConfig({ options: typeAware.options, jsPlugins: [...typeAware.jsPlugins], rules: typeAware.rules });
// EXPECT-TYPE-ERROR: unsupported Effect major is not a configuration option.
// @ts-expect-error effectVersion must be 3 or 4
export const invalidVersion: EffectRuleOptions = { effectVersion: 5 };
// EXPECT-TYPE-ERROR: string versions must not silently select legacy policy.
// @ts-expect-error effectVersion must be numeric
export const stringVersion: EffectRuleOptions = { effectVersion: "3" };
