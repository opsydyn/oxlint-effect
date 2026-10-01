import { Effect, Fiber, pipe } from "effect";
// Repair: the same lexical handle has an explicit observer.
export const joined = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.succeed(42));
  return yield* Fiber.join(fiber);
});
export const awaited = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.succeed(42));
  return yield* Fiber.await(fiber);
});
export const interrupted = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.never);
  yield* Fiber.interrupt(fiber);
  return yield* Fiber.await(fiber);
});
export const pipedJoin = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.succeed(42));
  return yield* fiber.pipe(Fiber.join);
});
export const functionalAwait = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.succeed(42));
  return yield* pipe(fiber, Fiber.await);
});
export const failure = <E>(original: E) => Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.fail(original));
  return yield* Fiber.join(fiber);
});
export const failureAwait = <E>(original: E) => Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.fail(original));
  return yield* Fiber.await(fiber);
});
// Clean: scope-owned forks are not classified by this observer rule.
export const scoped = Effect.scoped(Effect.gen(function* () {
  const fiber = yield* Effect.forkScoped(Effect.succeed(42));
  return yield* Fiber.join(fiber);
}));
