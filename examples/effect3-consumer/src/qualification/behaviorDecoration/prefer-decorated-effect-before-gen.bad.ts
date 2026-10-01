import { Effect } from "effect";
// EXPECT: linteffect/prefer-decorated-effect-before-gen (second decorated yield)
export const ordinary = Effect.gen(function* () { const first = yield* Effect.succeed("ready").pipe(Effect.withSpan("first")); const second = yield* Effect.succeed(first).pipe(Effect.timeout("1 second")); return second; });
