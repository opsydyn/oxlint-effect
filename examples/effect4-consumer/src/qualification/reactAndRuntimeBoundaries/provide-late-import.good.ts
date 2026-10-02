export const task = Effect.succeed(42).pipe(Effect.provide(Layer.empty));
import { Effect, Layer } from "effect";
