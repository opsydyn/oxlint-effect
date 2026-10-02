import { Effect, Fiber } from "effect";
// @lint-expect linteffect/no-unscoped-background-fiber
export const direct = <A, E>(task: Effect.Effect<A, E>) => Effect.forkDaemon(task);
// @lint-expect linteffect/no-unscoped-background-fiber: returning a handle does not bind lifetime.
export const returned = <A, E>(task: Effect.Effect<A, E>) => Effect.gen(function* () { return yield* Effect.forkDaemon(task); });
// @lint-expect linteffect/no-unscoped-background-fiber: join observes, but does not impose scoped teardown.
export const observed = <A, E>(task: Effect.Effect<A, E>) => Effect.gen(function* () { const fiber = yield* Effect.forkDaemon(task); return yield* Fiber.join(fiber); });
// @lint-expect linteffect/no-unscoped-background-fiber: a scope inside a detached child closes only when that child exits.
export const scopedInside = <A, E>(task: Effect.Effect<A, E>) => Effect.forkDaemon(Effect.scoped(task));
