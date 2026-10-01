import { Data, Effect, Layer, Option } from "effect";
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
export const original = new SourceError({ operation: "lookup" });
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
// EXPECT: linteffect/prefer-pipe-for-behavior (catchAll data-first)
export const recovering = Effect.catchAll(Effect.fail(original), (error) => Effect.fail(error));
// EXPECT: linteffect/prefer-pipe-for-behavior (catchSome data-first)
export const partial = Effect.catchSome(Effect.fail(original), () => Option.none());
// EXPECT: linteffect/prefer-pipe-for-behavior (timeoutFail data-first)
export const timeoutFailure = Effect.timeoutFail(Effect.succeed("ready"), { duration: "1 second", onTimeout: () => original });
