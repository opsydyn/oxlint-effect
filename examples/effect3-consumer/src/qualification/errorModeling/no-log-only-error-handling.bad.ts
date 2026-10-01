import { Data, Effect } from "effect";
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const program = Effect.fail(new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-log-only-error-handling (plain expression)
export const plain = Effect.catchAll(program, (error) => Effect.logError(error));
// EXPECT: linteffect/no-log-only-error-handling (piped block)
export const block = program.pipe(Effect.catchAll((error) => { return Effect.logWarning(error); }));
// EXPECT: linteffect/no-log-only-error-handling (legacy observer policy)
export const observer = program.pipe(Effect.tapError((error) => Effect.logError(error)));
