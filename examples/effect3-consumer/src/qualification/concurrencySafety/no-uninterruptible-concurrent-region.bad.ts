import { Effect, Queue } from "effect";
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const masked = <A, E>(task: Effect.Effect<A, E>) => Effect.uninterruptible(Effect.all([task], { concurrency: 1 }));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const forEach = Effect.uninterruptible(Effect.forEach([1, 2], value => Effect.succeed(value)));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const race = Effect.uninterruptible(Effect.race(Effect.succeed(42), Effect.succeed(42)));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const waiting = (queue: Queue.Dequeue<number>) => Effect.uninterruptible(Queue.take(queue));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const fork = Effect.uninterruptible(Effect.fork(Effect.succeed(42)));
