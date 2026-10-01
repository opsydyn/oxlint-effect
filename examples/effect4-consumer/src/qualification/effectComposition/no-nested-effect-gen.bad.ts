import { Effect } from "effect";
// EXPECT: linteffect/no-nested-effect-gen (ordinary nested generator)
export const ordinary = Effect.gen(function* () { return yield* Effect.gen(function* () { return yield* Effect.succeed("ready"); }); });
// EXPECT: linteffect/no-nested-effect-gen (self-bound outer generator)
export const contextual = Effect.gen({ self: { value: "ready" } }, function* () { return yield* Effect.gen(function* () { return yield* Effect.succeed("ready"); }); });
