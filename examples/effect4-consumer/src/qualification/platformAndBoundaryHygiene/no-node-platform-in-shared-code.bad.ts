// @lint-expect linteffect/no-node-platform-in-shared-code (five imports, including type-only).
import { basename } from "node:path";
import { lookup } from "dns/promises";
import { ReadableStream } from "stream/web";
import type { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
export const path = basename("/tmp/fixture");
export const adapters = { lookup, ReadableStream, readFileSync };
export type NativeBytes = Buffer;
