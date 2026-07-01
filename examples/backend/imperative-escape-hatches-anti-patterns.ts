import { Effect } from "effect";

declare const program: any;
declare const tasks: Array<Promise<number>>;

// EXPECT: linteffect/no-effect-ignore
// QA: Ignoring failures should be an explicit, reviewed boundary decision.
export const ignoredEffect = Effect.ignore(program);

// EXPECT: linteffect/no-try-catch
// EXPECT: linteffect/no-try-catch-in-effect-logic
// QA: try/catch inside Effect logic bypasses typed recovery and also trips the broad legacy rule.
export const tryCatchEffectLogic = Effect.gen(function* () {
  try {
    yield* Effect.succeed(1);
  } catch {
    yield* Effect.fail({ _tag: "Unexpected" });
  }
});

// EXPECT: linteffect/no-promise-api-in-effect-logic
// EXPECT: linteffect/no-promise-concurrency-in-effect
// QA: Promise APIs inside Effect logic bypass Effect scheduling, errors, and cancellation.
export const promiseEffectLogic = Effect.gen(function* () {
  Promise.all(tasks);
});
