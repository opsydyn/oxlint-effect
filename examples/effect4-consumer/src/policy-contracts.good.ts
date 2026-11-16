import { Context, Effect, Layer } from "effect";

// Valid service contracts may explicitly state success, error and requirements.
export class Counter extends Context.Service<Counter, { readonly read: Effect.Effect<number> }>()("Counter") {}
export type CounterProgram = Effect.Effect<number, never, Counter>;
export const CounterLive: Layer.Layer<Counter> = Layer.succeed(Counter, { read: Effect.succeed(42) });

// Valid traced operations are clean under recommended, not the opt-in style ban.
export const readCounter = Effect.fn("Counter.read")(function* () {
  const counter = yield* Counter;
  return yield* counter.read;
});
export const operationName = Effect.fn("Counter.span")(function* () {
  const span = yield* Effect.currentSpan;
  return span.name;
});
