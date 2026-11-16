// Legacy Effect 3 review corpus. These are not new linteffect diagnostics.
import { Data, Effect } from "effect";
import { type ProviderFailure } from "./cause-narrowing.good";

export class ErasedProfileFailure extends Data.TaggedError("ProfileBoundaryFailure")<{
  readonly operation: "profile.load";
}> {}

// REVIEW-ONLY: same public tag and operation, but the original failure is lost.
export function mapProfile<A, R>(operation: Effect.Effect<A, ProviderFailure, R>) {
  return Effect.mapError(operation, () => new ErasedProfileFailure({ operation: "profile.load" }));
}

// REVIEW-ONLY: returning a tagged failure does not by itself retain its cause.
export function recoverProfile<A, R>(operation: Effect.Effect<A, ProviderFailure, R>) {
  return Effect.catchAll(operation, () => Effect.fail(new ErasedProfileFailure({ operation: "profile.load" })));
}

// REVIEW-ONLY: constructing a reporting Effect does not execute that Effect.
export function captureAndMap<A, R>(
  operation: Effect.Effect<A, ProviderFailure, R>,
  capture: (failure: ProviderFailure) => Effect.Effect<void>,
) {
  return Effect.mapError(operation, (error) => {
    capture(error);
    return new ErasedProfileFailure({ operation: "profile.load" });
  });
}
