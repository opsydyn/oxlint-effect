import { Effect } from "effect";
// EXPECT: linteffect/no-yield-without-star-in-effect-gen (plain yield)
// @ts-expect-error Legacy gen requires yielded YieldWrap; this is an intentionally invalid type contract.
export const plain = Effect.gen(function* () { yield Effect.succeed("ready"); return "done"; });
