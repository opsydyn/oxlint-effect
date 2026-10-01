import { Effect, pipe } from "effect";
// linteffect/no-fire-and-forget-fork: bare child/detached constructors start no work.
export function discardedConstructors(task: Effect.Effect<number> = Effect.succeed(42)) {
  Effect.forkChild(task);
  Effect.forkDetach(task, { startImmediately: true });
}
// linteffect/no-fire-and-forget-fork: execution discards the child handle.
export const child = Effect.gen(function* () {
  yield* Effect.forkChild(Effect.succeed(42), { startImmediately: true });
  return 42;
});
// linteffect/no-fire-and-forget-fork: detached lifetime also needs explicit observation.
export const detached = Effect.gen(function* () {
  yield* Effect.forkDetach(Effect.succeed(42), { startImmediately: true });
  return 42;
});
// linteffect/no-fire-and-forget-fork: a bare pipe operator is recognised.
export const pipedChild = Effect.gen(function* () {
  yield* Effect.succeed(42).pipe(Effect.forkChild);
  return 42;
});
// linteffect/no-fire-and-forget-fork: data-last startup options in pipe.
export const pipedDetached = Effect.gen(function* () {
  yield* pipe(Effect.succeed(42), Effect.forkDetach({ startImmediately: true }));
  return 42;
});
// linteffect/no-fire-and-forget-fork: curried startup constructors lose handles too.
export const curriedChild = Effect.gen(function* () {
  yield* Effect.forkChild({ startImmediately: true })(Effect.succeed(42));
  return 42;
});
export const curriedDetached = Effect.gen(function* () {
  yield* Effect.forkDetach({ startImmediately: true })(Effect.succeed(42));
  return 42;
});
