import { Data, Effect, Layer, Option, Filter } from "effect";
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
export const original = new SourceError({ operation: "lookup" });
class ReasonError extends Data.TaggedError("ReasonError")<{ readonly field: string }> {}
class ParentError extends Data.TaggedError("ParentError")<{ readonly reason: ReasonError }> {}
const parent = new ParentError({ reason: new ReasonError({ field: "userId" }) });
// CLEAN: annotateLogs decoration stays outside the workflow.
export const logging = Effect.succeed("ready").pipe(Effect.annotateLogs({ operation: "lookup" }));
// CLEAN: as decoration stays outside the workflow.
export const value = Effect.succeed("ready").pipe(Effect.as("ready"));
// CLEAN: catchTag decoration stays outside the workflow.
export const tag = Effect.fail(original).pipe(Effect.catchTag("SourceError", (error) => Effect.fail(error)));
// CLEAN: map decoration stays outside the workflow.
export const mapping = Effect.succeed("ready").pipe(Effect.map((value) => value.toUpperCase()));
// CLEAN: mapBoth decoration stays outside the workflow.
export const channels = Effect.fail(original).pipe(Effect.mapBoth({ onFailure: (error) => error, onSuccess: (value) => value }));
// CLEAN: provide decoration stays outside the workflow.
export const provision = Effect.succeed("ready").pipe(Effect.provide(Layer.empty));
// CLEAN: retry decoration stays outside the workflow.
export const retrying = Effect.fail(original).pipe(Effect.retry({ times: 1 }));
// CLEAN: tap decoration stays outside the workflow.
export const observing = Effect.succeed("ready").pipe(Effect.tap(() => Effect.void));
// CLEAN: tapError decoration stays outside the workflow.
export const errors = Effect.fail(original).pipe(Effect.tapError(() => Effect.void));
// CLEAN: timeout decoration stays outside the workflow.
export const timing = Effect.succeed("ready").pipe(Effect.timeout("1 second"));
// CLEAN: withSpan decoration stays outside the workflow.
export const tracing = Effect.succeed("ready").pipe(Effect.withSpan("lookup"));
// CLEAN: catch decoration stays outside the workflow.
export const recovering = Effect.fail(original).pipe(Effect.catch((error) => Effect.fail(error)));
// CLEAN: catchEager decoration stays outside the workflow.
export const eager = Effect.fail(original).pipe(Effect.catchEager((error) => Effect.fail(error)));
// CLEAN: catchCause decoration stays outside the workflow.
export const cause = Effect.fail(original).pipe(Effect.catchCause((cause) => Effect.failCause(cause)));
// CLEAN: catchDefect decoration stays outside the workflow.
export const defect = Effect.die(original).pipe(Effect.catchDefect((defect) => Effect.die(defect)));
// CLEAN: catchIf decoration stays outside the workflow.
export const predicate = Effect.fail(original).pipe(Effect.catchIf(() => true, (error) => Effect.fail(error)));
// CLEAN: catchFilter decoration stays outside the workflow.
export const filter = Effect.fail(original).pipe(Effect.catchFilter(Filter.fromPredicate((error: SourceError) => error.operation.length > 0), (error) => Effect.fail(error)));
// CLEAN: catchCauseIf decoration stays outside the workflow.
export const causePredicate = Effect.fail(original).pipe(Effect.catchCauseIf(() => true, (cause) => Effect.failCause(cause)));
// CLEAN: catchCauseFilter decoration stays outside the workflow.
export const causeFilter = Effect.fail(original).pipe(Effect.catchCauseFilter(Filter.fromPredicate(() => true), (cause) => Effect.failCause(cause)));
// CLEAN: catchTags decoration stays outside the workflow.
export const tags = Effect.fail(original).pipe(Effect.catchTags({ SourceError: (error) => Effect.fail(error) }));
// CLEAN: timeoutOption decoration stays outside the workflow.
export const timeoutOptional = Effect.succeed("ready").pipe(Effect.timeoutOption("1 second"));
// CLEAN: timeoutOrElse decoration stays outside the workflow.
export const timeoutAlternative = Effect.succeed("ready").pipe(Effect.timeoutOrElse({ duration: "1 second", orElse: () => Effect.succeed("fallback") }));
// CLEAN: catchNoSuchElement decoration stays outside the workflow.
export const absence = Effect.succeed("ready").pipe(Effect.catchNoSuchElement);
// CLEAN: catchReason decoration stays outside the workflow.
export const reason = Effect.fail(parent).pipe(Effect.catchReason("ParentError", "ReasonError", (reason) => Effect.fail(reason)));
// CLEAN: catchReasons decoration stays outside the workflow.
export const reasons = Effect.fail(parent).pipe(Effect.catchReasons("ParentError", { ReasonError: (reason) => Effect.fail(reason) }));
