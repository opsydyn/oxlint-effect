import { Effect } from "effect";
// CLEAN: one generator owns the sequence.
export const flat = Effect.gen(function* () { const value = yield* Effect.succeed("ready"); return value; });
// CLEAN: named helper defined outside the outer workflow.
const helper = () => Effect.gen(function* () { return yield* Effect.succeed("ready"); });
export const composed = Effect.gen(function* () { return yield* helper(); });
