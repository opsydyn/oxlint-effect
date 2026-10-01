import { Data, Effect, Filter } from "effect";
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const program = Effect.fail(new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-log-only-error-handling (plain expression)
export const plain = Effect.catch(program, (error) => Effect.logError(error));
// EXPECT: linteffect/no-log-only-error-handling (piped block)
export const block = program.pipe(Effect.catch((error) => { return Effect.logWarning(error); }));
// EXPECT: linteffect/no-log-only-error-handling (eager)
export const eager = Effect.catchEager(program, (error) => Effect.logError(error));
// EXPECT: linteffect/no-log-only-error-handling (cause)
export const cause = Effect.catchCause(program, (cause) => Effect.logError(cause));
// EXPECT: linteffect/no-log-only-error-handling (defect)
export const defect = Effect.catchDefect(Effect.die("defect"), (defect) => Effect.logError(defect));
// EXPECT: linteffect/no-log-only-error-handling (predicate)
export const predicate = Effect.catchIf(program, () => true, (error) => Effect.logError(error));
// EXPECT: linteffect/no-log-only-error-handling (filter)
export const filter = Effect.catchFilter(program, Filter.fromPredicate((error: SourceError) => error.operation.length > 0), (error) => Effect.logError(error));
// EXPECT: linteffect/no-log-only-error-handling (causePredicate)
export const causePredicate = Effect.catchCauseIf(program, () => true, (cause) => Effect.logError(cause));
// EXPECT: linteffect/no-log-only-error-handling (causeFilter)
export const causeFilter = Effect.catchCauseFilter(program, Filter.fromPredicate(() => true), (cause) => Effect.logError(cause));
// EXPECT: linteffect/no-log-only-error-handling (tag)
export const tag = Effect.catchTag(program, "SourceError", (error) => Effect.logError(error));
// EXPECT: linteffect/no-log-only-error-handling (tags)
export const tags = Effect.catchTags(program, { SourceError: (error) => Effect.logError(error) });
class ReasonError extends Data.TaggedError("ReasonError")<{ readonly field: string }> {}
class ParentError extends Data.TaggedError("ParentError")<{ readonly reason: ReasonError }> {}
const reasonProgram = Effect.fail(new ParentError({ reason: new ReasonError({ field: "userId" }) }));
// EXPECT: linteffect/no-log-only-error-handling (reason)
export const reason = reasonProgram.pipe(Effect.catchReason("ParentError", "ReasonError", (error) => Effect.logError(error)));
// EXPECT: linteffect/no-log-only-error-handling (reason map)
export const reasons = reasonProgram.pipe(Effect.catchReasons("ParentError", { ReasonError: (error) => Effect.logError(error) }));
// EXPECT: linteffect/no-log-only-error-handling (nested unused failure does not own recovery)
export const nested = Effect.catch(program, (error) => { const unused = () => Effect.fail(error); void unused; return Effect.logError(error); });
