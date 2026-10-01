import { Data, Effect, Layer, Option, Filter } from "effect";
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
export const original = new SourceError({ operation: "lookup" });
class ReasonError extends Data.TaggedError("ReasonError")<{ readonly field: string }> {}
class ParentError extends Data.TaggedError("ParentError")<{ readonly reason: ReasonError }> {}
const parent = new ParentError({ reason: new ReasonError({ field: "userId" }) });
// EXPECT: linteffect/prefer-pipe-for-behavior (annotateLogs data-first)
export const logging = Effect.annotateLogs(Effect.succeed("ready"), { operation: "lookup" });
// EXPECT: linteffect/prefer-pipe-for-behavior (as data-first)
export const value = Effect.as(Effect.succeed("ready"), "ready");
// EXPECT: linteffect/prefer-pipe-for-behavior (catchTag data-first)
export const tag = Effect.catchTag(Effect.fail(original), "SourceError", (error) => Effect.fail(error));
// EXPECT: linteffect/prefer-pipe-for-behavior (map data-first)
export const mapping = Effect.map(Effect.succeed("ready"), (value) => value.toUpperCase());
// EXPECT: linteffect/prefer-pipe-for-behavior (mapBoth data-first)
export const channels = Effect.mapBoth(Effect.fail(original), { onFailure: (error) => error, onSuccess: (value) => value });
// EXPECT: linteffect/prefer-pipe-for-behavior (provide data-first)
export const provision = Effect.provide(Effect.succeed("ready"), Layer.empty);
// EXPECT: linteffect/prefer-pipe-for-behavior (retry data-first)
export const retrying = Effect.retry(Effect.fail(original), { times: 1 });
// EXPECT: linteffect/prefer-pipe-for-behavior (tap data-first)
export const observing = Effect.tap(Effect.succeed("ready"), () => Effect.void);
// EXPECT: linteffect/prefer-pipe-for-behavior (tapError data-first)
export const errors = Effect.tapError(Effect.fail(original), () => Effect.void);
// EXPECT: linteffect/prefer-pipe-for-behavior (timeout data-first)
export const timing = Effect.timeout(Effect.succeed("ready"), "1 second");
// EXPECT: linteffect/prefer-pipe-for-behavior (withSpan data-first)
export const tracing = Effect.withSpan(Effect.succeed("ready"), "lookup");
// EXPECT: linteffect/prefer-pipe-for-behavior (catch data-first)
export const recovering = Effect.catch(Effect.fail(original), (error) => Effect.fail(error));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchEager data-first)
export const eager = Effect.catchEager(Effect.fail(original), (error) => Effect.fail(error));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchCause data-first)
export const cause = Effect.catchCause(Effect.fail(original), (cause) => Effect.failCause(cause));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchDefect data-first)
export const defect = Effect.catchDefect(Effect.die(original), (defect) => Effect.die(defect));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchIf data-first)
export const predicate = Effect.catchIf(Effect.fail(original), () => true, (error) => Effect.fail(error));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchFilter data-first)
export const filter = Effect.catchFilter(Effect.fail(original), Filter.fromPredicate((error: SourceError) => error.operation.length > 0), (error) => Effect.fail(error));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchCauseIf data-first)
export const causePredicate = Effect.catchCauseIf(Effect.fail(original), () => true, (cause) => Effect.failCause(cause));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchCauseFilter data-first)
export const causeFilter = Effect.catchCauseFilter(Effect.fail(original), Filter.fromPredicate(() => true), (cause) => Effect.failCause(cause));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchTags data-first)
export const tags = Effect.catchTags(Effect.fail(original), { SourceError: (error) => Effect.fail(error) });
// EXPECT: linteffect/prefer-pipe-for-behavior (timeoutOption data-first)
export const timeoutOptional = Effect.timeoutOption(Effect.succeed("ready"), "1 second");
// EXPECT: linteffect/prefer-pipe-for-behavior (timeoutOrElse data-first)
export const timeoutAlternative = Effect.timeoutOrElse(Effect.succeed("ready"), { duration: "1 second", orElse: () => Effect.succeed("fallback") });
// EXPECT: linteffect/prefer-pipe-for-behavior (catchNoSuchElement data-first)
export const absence = Effect.catchNoSuchElement(Effect.succeed("ready"));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchReason data-first)
export const reason = Effect.catchReason(Effect.fail(parent), "ParentError", "ReasonError", (reason) => Effect.fail(reason));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchReasons data-first)
export const reasons = Effect.catchReasons(Effect.fail(parent), "ParentError", { ReasonError: (reason) => Effect.fail(reason) });
