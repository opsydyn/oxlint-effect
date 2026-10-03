// Effect 4 first-class asset; qualify against the pinned current consumer.
import { Effect } from "effect";
import { type ProfileUnavailable } from "./public-errors.good";

export function rejectProfile(error: ProfileUnavailable) {
  return Effect.fail(error);
}

export function rethrowProfile(operation: Effect.Effect<string, ProfileUnavailable>) {
  return operation;
}

export function observeProfile(operation: Effect.Effect<string, ProfileUnavailable>) {
  return Effect.catch(operation, (error) => Effect.gen(function* () {
    yield* Effect.logError(error);
    return yield* Effect.fail(error);
  }));
}
