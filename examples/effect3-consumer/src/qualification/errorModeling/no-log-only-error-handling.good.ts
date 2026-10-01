import { Data, Effect } from "effect";
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
export const original = new SourceError({ operation: "lookup" });
const program = Effect.fail(original);
// CLEAN: logging followed by typed re-failure retains ownership and identity.
export const retained = Effect.catchAll(program, (error) => Effect.logError(error).pipe(Effect.andThen(Effect.fail(error))));
// CLEAN: unrelated non-Effect receiver.
const Other = { catchAll: (callback: () => unknown) => callback };
export const unrelated = Other.catchAll(() => Effect.logError(original));
