import { Effect } from "effect";
// EXPECT: linteffect/no-effect-fn-generator (anonymous)
export const anonymous = Effect.fn(function* () { return yield* Effect.succeed("ready"); });
// EXPECT: linteffect/no-effect-fn-generator (named factory application)
export const named = Effect.fn("operation")(function* () { return yield* Effect.succeed("ready"); });
