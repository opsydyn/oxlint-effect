import { Effect, Fiber, pipe } from "effect";
// Repair: the same lexical handle has an explicit observer.
export const joined = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.succeed(42));
  return yield* Fiber.join(fiber);
});
export const awaited = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.succeed(42));
  return yield* Fiber.await(fiber);
});
export const interrupted = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.never);
  yield* Fiber.interrupt(fiber);
  return yield* Fiber.await(fiber);
});
export const pipedJoin = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.succeed(42));
  return yield* fiber.pipe(Fiber.join);
});
export const functionalAwait = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.succeed(42));
  return yield* pipe(fiber, Fiber.await);
});
export const failure = <E>(original: E) => Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.fail(original));
  return yield* Fiber.join(fiber);
});
export const failureAwait = <E>(original: E) => Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.fail(original));
  return yield* Fiber.await(fiber);
});
// Clean: scope-owned forks are not classified by this observer rule.
export const scoped = Effect.scoped(Effect.gen(function* () {
  const fiber = yield* Effect.forkScoped(Effect.succeed(42));
  return yield* Fiber.join(fiber);
}));
// Clean: lazy Effect values are not fiber handles.
export const lazy = Effect.forkChild(Effect.succeed(42));
// Clean: explicit transfer of a detached handle; the caller must observe it.
export const returned = Effect.gen(function* () {
  const fiber = yield* Effect.forkDetach(Effect.succeed(42), { startImmediately: true });
  return fiber;
});
// Repair: same-name scopes and block shadows each observe their own binding.
export const shadowed = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.succeed(42));
  {
    const fiber = yield* Effect.forkChild(Effect.succeed(42));
    yield* Fiber.join(fiber);
  }
  return yield* Fiber.join(fiber);
});
