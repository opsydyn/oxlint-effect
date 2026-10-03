import { minify } from "terser";

export async function minifyPackageChunk(code: string, fileName: string) {
  if (!fileName.endsWith(".mjs")) return null;

  const result = await minify({ [fileName]: code }, {
    module: true,
    ecma: 2022,
    // Function reduction is disproportionately expensive for the large preset factory.
    compress: { passes: 2, reduce_funcs: false, hoist_funs: true },
    sourceMap: true,
  });
  if (result.code === undefined || typeof result.map !== "string") {
    throw new Error(`Missing minified code or source map for ${fileName}`);
  }
  return { code: result.code, map: result.map };
}
