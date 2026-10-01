import { Effect, Fiber } from "effect";
// Repair: execution retains and observes the fiber result and failure.
export const joined = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.succeed(42));
  return yield* Fiber.join(fiber);
});
export const failing = <E>(error: E) => Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.fail(error));
  return yield* Fiber.join(fiber);
});
// Clean: a return preserves the lazy construction for the caller.
export const returned = () => Effect.forkChild(Effect.succeed(42));
// Clean: explicit scoped lifetime does not require this rule's handle binding.
export const scoped = Effect.scoped(Effect.gen(function* () {
  yield* Effect.forkScoped(Effect.succeed(42));
  const scope = yield* Effect.scope;
  yield* Effect.forkIn(Effect.succeed(42), scope);
  return 42;
}));
// Repair: joining after a piped fork is observation, not a discarded fork.
export const pipedJoin = Effect.succeed(42).pipe(Effect.forkChild, Effect.flatMap(Fiber.join));
export const detachedJoin = Effect.gen(function* () {
  const fiber = yield* Effect.forkDetach(Effect.succeed(42), { startImmediately: true });
  return yield* Fiber.join(fiber);
});
export const curriedChild = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild({ startImmediately: true })(Effect.succeed(42));
  return yield* Fiber.join(fiber);
});
export const curriedDetached = Effect.gen(function* () {
  const fiber = yield* Effect.forkDetach({ startImmediately: true })(Effect.succeed(42));
  return yield* Fiber.join(fiber);
});
