import { Effect, Fiber } from "effect";
// Repair: one collection budget, while retaining every result.
export const counted = Effect.forEach([1, 2, 3], value => Effect.succeed(value), { concurrency: 2 });
export const values = counted;
export const keys = counted;
export const whileLoop = counted;
export const doLoop = counted;
// Clean: a fork outside a loop is owned and joined.
export const single = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.succeed(42));
  return yield* Fiber.join(fiber);
});
// Clean scope control, not proof of a bounded collection: scoped APIs are excluded.
export const scoped = Effect.scoped(Effect.gen(function* () {
  for (const value of [1, 2, 3]) { yield* Effect.forkScoped(Effect.succeed(value)); }
  return 42;
}));
