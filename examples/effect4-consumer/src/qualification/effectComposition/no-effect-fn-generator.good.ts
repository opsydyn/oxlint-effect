import { Effect } from "effect";
// CLEAN: plain function returns a single generator effect.
export const operation = () => Effect.gen(function* () { return yield* Effect.succeed("ready"); });
// CLEAN: fn with a non-generator body remains valid.
export const traced = Effect.fn("operation")(() => Effect.succeed("ready"));
