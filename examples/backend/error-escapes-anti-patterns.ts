import { Effect } from "effect";

declare const program: any;

// EXPECT: linteffect/no-throw-in-effect-logic
// QA: Throwing inside Effect logic bypasses typed failure channels.
export const throwingEffectLogic = Effect.gen(function* () {
  throw { _tag: "Unexpected" };
});

// EXPECT: linteffect/no-or-die-outside-boundary
// QA: Defect conversion should be reserved for explicit runtime boundaries.
export const dyingEffectLogic = Effect.orDie(program);

// EXPECT: linteffect/no-swallowed-catch-all
// QA: catchAll handlers should log, re-fail, or recover with a meaningful typed branch.
export const swallowedCatchAll = Effect.catchAll(() => Effect.succeed({ fallback: true }));
