import { Effect } from "effect";
import { FileSystem } from "effect";
export const read = (path: string) => Effect.gen(function* () { const fs = yield* FileSystem.FileSystem; return yield* fs.readFileString(path); });
export const files = new Map([["fixture", "42"]]);
export const testLayer = FileSystem.layerNoop({ readFileString: path => Effect.sync(() => files.get(path) ?? "missing") });
// Function-local require is a retained detector gap, not portable code.
export function opaque() { const fs: typeof import("node:fs") = require("node:fs"); return fs; }
