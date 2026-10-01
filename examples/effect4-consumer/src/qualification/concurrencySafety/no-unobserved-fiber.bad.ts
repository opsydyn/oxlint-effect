import { Effect, Fiber } from "effect";
// linteffect/no-unobserved-fiber: executing a fork is different from storing its Effect.
export const direct = Effect.gen(function* () {
  const orphanChild = yield* Effect.forkChild(Effect.succeed(42), { startImmediately: true });
  void orphanChild;
  return 42;
});
export const detached = Effect.gen(function* () {
  const orphanDetach = yield* Effect.forkDetach(Effect.succeed(42), { startImmediately: true });
  void orphanDetach;
  return 42;
});
// linteffect/no-unobserved-fiber: yielded member-pipe and curried startup forms.
export const piped = Effect.gen(function* () {
  const orphanPipe = yield* Effect.succeed(42).pipe(Effect.forkChild);
  void orphanPipe;
  return 42;
});
export const curried = Effect.gen(function* () {
  const orphanCurried = yield* Effect.forkDetach({ startImmediately: true })(Effect.succeed(42));
  void orphanCurried;
  return 42;
});
// linteffect/no-unobserved-fiber: same spelling in another function is not observation.
export const sameNameUnobserved = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.succeed(42), { startImmediately: true });
  void fiber;
  return 42;
});
export const sameNameObserved = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.succeed(42));
  return yield* Fiber.join(fiber);
});
// linteffect/no-unobserved-fiber: block-shadowed joins do not observe the outer handle.
export const shadowed = Effect.gen(function* () {
  const fiber = yield* Effect.forkChild(Effect.succeed(42), { startImmediately: true });
  {
    const fiber = yield* Effect.forkChild(Effect.succeed(42));
    yield* Fiber.join(fiber);
  }
  void fiber;
  return 42;
});
