import { Data, Effect } from "effect";
class StorageError extends Data.TaggedError("StorageError")<{ readonly operation: string }> {}
export const original = new StorageError({ operation: "read" });
const failed = Effect.fail(original);
// CLEAN: retain failure or recover through an explicit typed domain branch.
export const retained = failed.pipe(Effect.catchAll((error) => Effect.fail(error)));
export const tagged = Effect.catchTag(failed, "StorageError", (error) => Effect.succeed(error.operation));
