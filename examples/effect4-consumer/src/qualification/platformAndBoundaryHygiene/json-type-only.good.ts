import { Effect } from "effect";
import type { Schema } from "effect";
export type Evidence = Schema.Schema<number>;
// Retained import-presence counterexample: type-only Schema cannot validate at runtime.
export const raw = (text: string) => Effect.succeed(JSON.parse(text));
