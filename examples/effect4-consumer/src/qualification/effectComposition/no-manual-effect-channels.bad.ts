import { Data, Effect, Layer } from "effect";
class StorageError extends Data.TaggedError("StorageError")<{ readonly operation: string }> {}
// EXPECT: linteffect/no-manual-effect-channels (Effect tuple)
export const program: Effect.Effect<string, StorageError, never> = Effect.succeed("ready");
// EXPECT: linteffect/no-manual-effect-channels (Layer tuple)
export const empty: Layer.Layer<never, never, never> = Layer.empty;
