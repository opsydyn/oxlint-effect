import { Effect } from "effect";

declare const program: any;

// EXPECT: linteffect/no-yield-without-star-in-effect-gen
// QA: Effect.gen should delegate with yield* so Effect values are interpreted.
export const badYield = Effect.gen(function* () {
  yield Effect.succeed(1);
});

// EXPECT: linteffect/no-async-effect-combinator-callback
// QA: Async callbacks in Effect combinators return Promises and bypass Effect error/cancel semantics.
export const asyncCombinatorCallback = Effect.map(program, async (current) => current + 1);

// EXPECT: linteffect/no-run-effect-outside-boundary
// QA: Effect execution should happen at explicit runtime boundaries.
export const runInsideDomainLogic = Effect.runPromise(program);
