import { Effect } from "effect";
// @lint-expect linteffect/no-node-fs-in-effect-code: application paths do not exempt direct filesystem imports.
import { readFileSync } from "node:fs";
export const read = (path: string) => Effect.sync(() => readFileSync(path, "utf8"));
