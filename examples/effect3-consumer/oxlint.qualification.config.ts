import { defineConfig } from "oxlint";
import { jsPlugins } from "@opsydyn/oxlint-effect";

// The harness supplies exactly one rule per case using a generated JSON config.
export default defineConfig({ categories: { correctness: "off" }, jsPlugins: [...jsPlugins] });
