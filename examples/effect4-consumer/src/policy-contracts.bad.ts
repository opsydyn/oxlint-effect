import { Effect } from "effect";

// EXPECT: linteffect/no-throw-in-effect-logic
// QA: Effect.fn is supported, but throwing is not a typed domain failure.
export const unsafeOperation = Effect.fn("Counter.unsafe")(function* () {
  throw { _tag: "UnmodelledFailure" };
});
