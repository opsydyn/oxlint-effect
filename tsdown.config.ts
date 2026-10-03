import { defineConfig } from "tsdown";
import { minifyPackageChunk } from "./scripts/minify-package.ts";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  plugins: [{
    name: "package-minifier",
    renderChunk(code, chunk) {
      return minifyPackageChunk(code, chunk.fileName);
    },
  }],
  target: "node22",
  outDir: "dist",
  deps: {
    neverBundle: ["@oxlint/plugins"],
  },
});
