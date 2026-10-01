import { Data, Effect } from "effect";
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
export const original = new SourceError({ operation: "lookup" });
const program = Effect.fail(original);
// CLEAN: logging followed by typed re-failure retains ownership and identity.
export const retained = Effect.catch(program, (error) => Effect.logError(error).pipe(Effect.andThen(Effect.fail(error))));
// CLEAN: unrelated non-Effect receiver.
const Other = { catch: (callback: () => unknown) => callback };
export const unrelated = Other.catch(() => Effect.logError(original));
// CLEAN: observers preserve failure without recovery.
export const observed = program.pipe(Effect.tapError((error) => Effect.logError(error)));
export const causeObserved = program.pipe(Effect.tapCause((cause) => Effect.logError(cause)));
export const defectObserved = Effect.die(original).pipe(Effect.tapDefect((defect) => Effect.logError(defect)));
export const eager = program.pipe(Effect.catchEager((error) => Effect.logError(error).pipe(Effect.andThen(Effect.fail(error)))));
export const causeRetained = Effect.catchCause(program, (cause) => Effect.logError(cause).pipe(Effect.andThen(Effect.failCause(cause))));
export const defectRetained = Effect.catchDefect(Effect.die(original), (defect) => Effect.logError(defect).pipe(Effect.andThen(Effect.die(defect))));
// CLEAN: an unused logger nested in a handler is not its returned recovery.
export const unusedLog = Effect.catch(program, (error) => { const unused = () => Effect.logError(error); void unused; return Effect.fail(error); });
