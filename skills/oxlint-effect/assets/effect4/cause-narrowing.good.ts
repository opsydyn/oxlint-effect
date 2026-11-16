// Effect 4 first-class asset; qualify against the pinned current consumer.
import { Data, Effect } from "effect";

export class ProviderFailure extends Data.TaggedError("ProviderFailure")<{
  readonly code: number;
  readonly cause: unknown;
}> {}

export class ProfileBoundaryFailure extends Data.TaggedError("ProfileBoundaryFailure")<{
  readonly operation: "profile.load";
  readonly cause: ProviderFailure;
}> {}

export function mapProfile<A, R>(operation: Effect.Effect<A, ProviderFailure, R>) {
  return Effect.mapError(operation, (cause) => new ProfileBoundaryFailure({ operation: "profile.load", cause }));
}

export function recoverProfile<A, R>(operation: Effect.Effect<A, ProviderFailure, R>) {
  return Effect.catch(operation, (cause) => Effect.fail(new ProfileBoundaryFailure({ operation: "profile.load", cause })));
}

export function captureAndMap<A, R>(
  operation: Effect.Effect<A, ProviderFailure, R>,
  capture: (failure: ProviderFailure) => Effect.Effect<void>,
) {
  return mapProfile(Effect.tapError(operation, capture));
}

// This fixture's owned public projection deliberately omits internal causes.
export function toPublicFailure(error: ProfileBoundaryFailure) {
  return { _tag: "ProfileBoundaryFailure" as const, operation: error.operation };
}
