import { Effect } from "effect";

declare const program: any;
declare const error: { readonly message: string };

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

// EXPECT: linteffect/no-effect-fail-error-message
// QA: Error messages should not replace structured failures.
export const stringifiedFailure = Effect.fail(error.message);

// EXPECT: linteffect/no-catchall-generic-rethrow
// QA: catchAll should preserve or map the original failure, not create generic Error.
export const genericRethrow = Effect.catchAll(
  program,
  (caught) => Effect.fail(new Error(caught.message)),
);

// EXPECT: linteffect/no-log-only-error-handling
// QA: Logging alone does not define typed failure ownership.
export const logOnlyRecovery = Effect.catchAll(
  program,
  (caught) => Effect.logError(caught),
);
