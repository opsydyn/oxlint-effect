import { Effect } from "effect";
// Mask only the critical section; restore makes waiting work interruptible.
export const restored = <A, E>(task: Effect.Effect<A, E>) => Effect.uninterruptibleMask(restore => restore(Effect.all([task], { concurrency: 1 })));
export const short = Effect.uninterruptible(Effect.sync(() => 42));
// Scoping alone does not restore interruption. Named work is a syntax limit.
const stored = Effect.all([Effect.succeed(42)]);
export const opaque = Effect.uninterruptible(stored);
// A stored ordinary helper is not executed just by returning its function.
export const nested = Effect.uninterruptible(Effect.gen(function* () { yield* Effect.void; return () => Effect.forkChild(Effect.succeed(42)); }));
