import { Effect } from "effect";
// Mask only the critical section; restore makes waiting work interruptible.
export const restored = <A, E>(task: Effect.Effect<A, E>) => Effect.uninterruptibleMask(restore => restore(Effect.all([task], { concurrency: 1 })));
export const short = Effect.uninterruptible(Effect.sync(() => 42));
// Scoping alone does not restore interruption. Named work is a syntax limit.
const stored = Effect.all([Effect.succeed(42)]);
export const opaque = Effect.uninterruptible(stored);
