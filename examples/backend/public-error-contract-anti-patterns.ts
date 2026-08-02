import { Effect } from "effect";

declare const program: any;

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
