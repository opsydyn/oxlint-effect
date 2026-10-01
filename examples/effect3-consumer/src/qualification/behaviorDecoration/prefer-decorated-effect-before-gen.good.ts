import { Effect } from "effect";
const first = Effect.succeed("ready").pipe(Effect.withSpan("first"));
const second = Effect.succeed("ready").pipe(Effect.timeout("1 second"));
// CLEAN: decorated effects have names before the workflow starts.
export const extracted = Effect.gen(function* () { yield* first; return yield* second; });
// CLEAN: below the repeated-decoration threshold.
export const single = Effect.gen(function* () { return yield* Effect.succeed("ready").pipe(Effect.withSpan("single")); });
