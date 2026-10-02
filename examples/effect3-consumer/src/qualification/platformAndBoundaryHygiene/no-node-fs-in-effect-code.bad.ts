import { Effect } from "effect";
// @lint-expect linteffect/no-node-fs-in-effect-code (four import and four module-scope require forms).
import * as fs from "fs";
import * as nodeFs from "node:fs";
import * as promises from "fs/promises";
import * as nodePromises from "node:fs/promises";
const fsRequire: typeof fs = require("fs");
const nodeFsRequire: typeof nodeFs = require("node:fs");
const promisesRequire: typeof promises = require("fs/promises");
const nodePromisesRequire: typeof nodePromises = require("node:fs/promises");
export const syncRead = (path: string) => Effect.sync(() => fs.readFileSync(path, "utf8"));
export const asyncRead = (path: string) => Effect.tryPromise({ try: () => promises.readFile(path, "utf8"), catch: error => error });
export const readers = [fs, nodeFs, fsRequire, nodeFsRequire];
export const asyncReaders = [promises, nodePromises, promisesRequire, nodePromisesRequire];
