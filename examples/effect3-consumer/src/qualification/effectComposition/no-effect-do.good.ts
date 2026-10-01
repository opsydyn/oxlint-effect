import { Effect } from "effect";
// CLEAN: explicit sequencing without builder state.
export const direct = Effect.succeed({});
export const piped = Effect.gen(function* () { const value = yield* Effect.succeed(1); return { value }; });
const Other = { Do: {} };
export const unrelated = Other.Do;
