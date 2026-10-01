import { Data, Effect } from "effect";
class StorageError extends Data.TaggedError("StorageError")<{ readonly operation: string }> {}
export const original = new StorageError({ operation: "read" });
const failed = Effect.fail(original);
// CLEAN: retain failure or recover through an explicit typed domain branch.
export const retained = failed.pipe(Effect.catch((error) => Effect.fail(error)));
export const tagged = Effect.catchTag(failed, "StorageError", (error) => Effect.succeed(error.operation));
// CLEAN: asVoid discards success, not failure.
export const voidRetained = Effect.catch(failed, (error) => Effect.asVoid(Effect.fail(error)));
export const causeRetained = Effect.catchCause(failed, (cause) => Effect.failCause(cause));
