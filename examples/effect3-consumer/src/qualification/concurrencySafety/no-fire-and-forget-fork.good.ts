import { Effect, Fiber } from "effect";
// Repair: execution retains and observes the fiber result and failure.
export const joined = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.succeed(42));
  return yield* Fiber.join(fiber);
});
export const failing = <E>(error: E) => Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.fail(error));
  return yield* Fiber.join(fiber);
});
// Clean: a return preserves the lazy construction for the caller.
export const returned = () => Effect.fork(Effect.succeed(42));
// Clean: explicit scoped lifetime does not require this rule's handle binding.
export const scoped = Effect.scoped(Effect.gen(function* () {
  yield* Effect.forkScoped(Effect.succeed(42));
  const scope = yield* Effect.scope;
  yield* Effect.forkIn(Effect.succeed(42), scope);
  return 42;
}));
// Known legacy limit: yielded handles were never inspected by this rule.
export const ignoredYield = Effect.gen(function* () { yield* Effect.fork(Effect.succeed(42)); return 42; });
