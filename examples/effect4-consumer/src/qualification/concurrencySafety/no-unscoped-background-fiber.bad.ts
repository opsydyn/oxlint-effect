import { Effect, Fiber, pipe } from "effect";
// @lint-expect linteffect/no-unscoped-background-fiber
export const direct = <A, E>(task: Effect.Effect<A, E>) => Effect.forkDetach(task);
// @lint-expect linteffect/no-unscoped-background-fiber: returning a handle does not bind lifetime.
export const returned = <A, E>(task: Effect.Effect<A, E>) => Effect.gen(function* () { return yield* Effect.forkDetach(task); });
// @lint-expect linteffect/no-unscoped-background-fiber: join observes, but does not impose scoped teardown.
export const observed = <A, E>(task: Effect.Effect<A, E>) => Effect.gen(function* () { const fiber = yield* Effect.forkDetach(task); return yield* Fiber.join(fiber); });
// @lint-expect linteffect/no-unscoped-background-fiber: a scope inside a detached child closes only when that child exits.
export const scopedInside = <A, E>(task: Effect.Effect<A, E>) => Effect.forkDetach(Effect.scoped(task));
// @lint-expect linteffect/no-unscoped-background-fiber
export const piped = <A, E>(task: Effect.Effect<A, E>) => task.pipe(Effect.forkDetach);
// @lint-expect linteffect/no-unscoped-background-fiber
export const options = <A, E>(task: Effect.Effect<A, E>) => task.pipe(Effect.forkDetach({ startImmediately: true }));
// @lint-expect linteffect/no-unscoped-background-fiber
export const curried = <A, E>(task: Effect.Effect<A, E>) => Effect.forkDetach({ startImmediately: true })(task);
// @lint-expect linteffect/no-unscoped-background-fiber
export const functionPipe = <A, E>(task: Effect.Effect<A, E>) => pipe(task, Effect.forkDetach);
