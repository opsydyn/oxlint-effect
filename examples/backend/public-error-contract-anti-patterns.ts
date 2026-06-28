import { Effect } from "effect";

declare const program: any;

// EXPECT: linteffect/no-manual-effect-channels
// EXPECT: linteffect/no-public-generic-effect-error
// QA: Public APIs should expose structured domain errors, not generic Error.
export function loadPublicUser(): Effect.Effect<{ readonly id: string }, Error, never> {
  return program;
}
