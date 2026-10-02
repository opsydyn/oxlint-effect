import { Effect, Fiber, Ref } from "effect";
// Atomic update keeps the read-modify-write inside one Ref operation.
export const count = Effect.gen(function* () {
  const completed = yield* Ref.make(0);
  yield* Effect.forEach([1, 2], () => Ref.update(completed, value => value + 1), { concurrency: 2 });
  return yield* Ref.get(completed);
});
export const values = Effect.forEach([1, 2], value => Effect.succeed(value), { concurrency: 2 });
// Worker-local state has no shared lexical binding.
export const local = Effect.fork(Effect.sync(() => { let completed = 0; completed++; return completed; }));
export const observedLocal = Effect.gen(function* () { const fiber = yield* local; return yield* Fiber.join(fiber); });
