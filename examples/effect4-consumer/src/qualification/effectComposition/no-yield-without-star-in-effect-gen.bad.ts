import { Effect } from "effect";
// EXPECT: linteffect/no-yield-without-star-in-effect-gen (plain yield)
export const plain = Effect.gen(function* () { yield Effect.succeed("ready"); return "done"; });
// EXPECT: linteffect/no-yield-without-star-in-effect-gen (self-bound plain yield)
export const contextual = Effect.gen({ self: { value: "ready" } }, function* () { yield Effect.succeed(this.value); return "done"; });
