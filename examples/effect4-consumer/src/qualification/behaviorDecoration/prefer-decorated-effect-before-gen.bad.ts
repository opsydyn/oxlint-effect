import { Effect } from "effect";
// EXPECT: linteffect/prefer-decorated-effect-before-gen (second decorated yield)
export const ordinary = Effect.gen(function* () { const first = yield* Effect.succeed("ready").pipe(Effect.withSpan("first")); const second = yield* Effect.succeed(first).pipe(Effect.timeout("1 second")); return second; });
// EXPECT: linteffect/prefer-decorated-effect-before-gen (self-bound recovery yields)
export const contextual = Effect.gen({ self: {} }, function* () { yield* Effect.fail("one").pipe(Effect.catch(() => Effect.succeed("ready"))); return yield* Effect.fail("two").pipe(Effect.catchEager(() => Effect.succeed("ready"))); });
