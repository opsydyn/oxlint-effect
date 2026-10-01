import { Effect } from "effect";

declare const program: any;

// Effect 3 reference; Effect 4 equivalents live in examples/effect4-consumer.
const sourceFailure = Effect.fail({ _tag: "UserLoadFailed", userId: "user-1" });
// EXPECT: linteffect/no-catchall-generic-rethrow
export const genericRecovery = sourceFailure.pipe(Effect.catchAll(() => Effect.fail(new Error("load failed"))));
// EXPECT: linteffect/no-early-catchall-null
export const prematureRecovery = sourceFailure.pipe(Effect.catchAll(() => Effect.succeed(null)));
// CLEAN for these recovery rules: preserve the structured failure.
export const preservedFailure = sourceFailure.pipe(Effect.catchAll((error) => Effect.fail(error)));

// EXPECT: linteffect/no-manual-effect-channels
// EXPECT: linteffect/no-public-generic-effect-error
// QA: Public APIs should expose structured domain errors, not generic Error.
export function loadPublicUser(): Effect.Effect<{ readonly id: string }, Error, never> {
  return program;
}

// EXPECT: linteffect/no-error-as-public-effect-error
export function loadWithGenericFailure(): Effect.Effect<{ readonly id: string }, Error, never> {
  return program;
}

// EXPECT: linteffect/no-unknown-public-error-channel
export function loadWithUnknownFailure(): Effect.Effect<{ readonly id: string }, unknown, never> {
  return program;
}

// EXPECT: linteffect/no-mixed-effect-error-shapes
export function loadWithMixedFailures(): Effect.Effect<{ readonly id: string }, Error | string, never> {
  return program;
}
