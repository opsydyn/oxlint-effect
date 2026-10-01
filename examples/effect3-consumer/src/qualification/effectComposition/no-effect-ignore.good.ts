import { Data, Effect } from "effect";
class StorageError extends Data.TaggedError("StorageError")<{ readonly operation: string }> {}
export const original = new StorageError({ operation: "read" });
// CLEAN: retain typed failure ownership with observability.
export const retained = Effect.catchAll(Effect.fail(original), (error) => Effect.logError(error).pipe(Effect.andThen(Effect.fail(error))));
const Other = { ignore: (value: number) => value };
export const unrelated = Other.ignore(1);
