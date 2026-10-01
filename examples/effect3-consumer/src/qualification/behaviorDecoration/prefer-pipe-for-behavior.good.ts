import { Data, Effect, Layer, Option } from "effect";
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
export const original = new SourceError({ operation: "lookup" });
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
// CLEAN: catchAll decoration stays outside the workflow.
export const recovering = Effect.fail(original).pipe(Effect.catchAll((error) => Effect.fail(error)));
// CLEAN: catchSome decoration stays outside the workflow.
export const partial = Effect.fail(original).pipe(Effect.catchSome(() => Option.none()));
// CLEAN: timeoutFail decoration stays outside the workflow.
export const timeoutFailure = Effect.succeed("ready").pipe(Effect.timeoutFail({ duration: "1 second", onTimeout: () => original }));
