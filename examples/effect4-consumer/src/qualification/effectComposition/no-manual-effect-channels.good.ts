import { Effect, Layer } from "effect";
// CLEAN: infer composed channels.
export const program = Effect.succeed("ready");
export const empty = Layer.empty;
export type Program = typeof program;
export type Empty = typeof empty;
