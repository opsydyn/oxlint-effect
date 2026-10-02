import { Context, Effect, Layer } from "effect";
interface PathService { readonly basename: (path: string) => string }
export const Paths = Context.GenericTag<PathService>("Q26Paths");
export const fixtureLayer = Layer.succeed(Paths, { basename: path => path.split("/").at(-1) ?? "" });
export const basename = (path: string) => Effect.gen(function* () { const paths = yield* Paths; return paths.basename(path); });
// Require is outside this import-only rule, not a portability repair.
export const opaque = () => { const path: typeof import("node:path") = require("node:path"); return path.basename("/tmp/fixture"); };
