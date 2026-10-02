import { Effect, Queue, PubSub, Scope } from "effect";
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const masked = <A, E>(task: Effect.Effect<A, E>) => Effect.uninterruptible(Effect.all([task], { concurrency: 1 }));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const forEach = Effect.uninterruptible(Effect.forEach([1, 2], value => Effect.succeed(value)));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const race = Effect.uninterruptible(Effect.race(Effect.succeed(42), Effect.succeed(42)));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const waiting = (queue: Queue.Dequeue<number>) => Effect.uninterruptible(Queue.take(queue));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const fork = Effect.uninterruptible(Effect.forkChild(Effect.succeed(42)));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const detached = Effect.uninterruptible(Effect.forkDetach(Effect.succeed(42)));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const scopedFork = Effect.scoped(Effect.uninterruptible(Effect.forkScoped(Effect.succeed(42))));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const forkIn = (scope: Scope.Scope) => Effect.uninterruptible(Effect.forkIn(Effect.succeed(42), scope));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const first = Effect.uninterruptible(Effect.raceFirst(Effect.succeed(42), Effect.succeed(42)));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const allFirst = Effect.uninterruptible(Effect.raceAllFirst([Effect.succeed(42)]));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const piped = Effect.all([Effect.succeed(42)]).pipe(Effect.uninterruptible);
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const generator = Effect.uninterruptible(Effect.gen({ self: { value: 42 } }, function* () { return yield* Effect.raceFirst(Effect.succeed(this.value), Effect.succeed(42)); }));
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const named = Effect.uninterruptible(Effect.fn("masked")(function* () { return yield* Effect.raceFirst(Effect.succeed(42), Effect.succeed(42)); })());
// @lint-expect linteffect/no-uninterruptible-concurrent-region
export const subscription = (sub: PubSub.Subscription<number>) => Effect.uninterruptible(PubSub.take(sub));
