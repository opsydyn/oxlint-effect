import { Effect } from "effect";
import { type ProfileUnavailable } from "./public-errors.good";

// EXPECT: linteffect/no-effect-fail-error-message
// QA: Converting the structured error to its message loses the tag and cause.
export function rejectProfile(error: ProfileUnavailable) {
  return Effect.fail(error.message);
}

// EXPECT: linteffect/no-catchall-generic-rethrow
// QA: Replacing every typed failure with a generic error erases the original.
export function rethrowProfile(operation: Effect.Effect<string, ProfileUnavailable>) {
  return Effect.catchAll(operation, () => Effect.fail(new Error("profile failed")));
}

// EXPECT: linteffect/no-log-only-error-handling
// QA: This handler turns the original failure into successful void after logging.
export function observeProfile(operation: Effect.Effect<string, ProfileUnavailable>) {
  return Effect.catchAll(operation, (error) => Effect.logError(error));
}
