import { Context, Effect, Layer } from "effect";

export class Counter extends Context.Service<Counter, {
  readonly read: Effect.Effect<number>;
}>()("Counter") {}

export type CounterProgram = Effect.Effect<number, never, Counter>;
export const CounterLive: Layer.Layer<Counter> = Layer.succeed(Counter, {
  read: Effect.succeed(42),
});

export const readCounter = Effect.fn("Counter.read")(function* () {
  const counter = yield* Counter;
  return yield* counter.read;
});
