import { Effect } from "effect";
// EXPECT: linteffect/no-nested-effect-gen (ordinary nested generator)
export const ordinary = Effect.gen(function* () { return yield* Effect.gen(function* () { return yield* Effect.succeed("ready"); }); });
