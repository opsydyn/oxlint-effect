import { Deferred, Effect, Semaphore } from "effect";
type Permit = Semaphore.Semaphore;
// Only unrelated coordination moves out; this would not preserve an I/O rate limit.
export const narrowed = <E>(semaphore: Permit, gate: Deferred.Deferred<number, E>, started: Deferred.Deferred<void>) => Effect.gen(function* () { yield* semaphore.withPermits(1)(Effect.sync(() => 42)); yield* Deferred.succeed(started, undefined); return yield* Deferred.await(gate); });
export const sync = (semaphore: Permit) => semaphore.withPermits(1)(Effect.sync(() => 42));
// Named tasks are not inspected, not a guarantee that they never suspend.
export const opaque = <A, E>(semaphore: Permit, task: Effect.Effect<A, E>) => semaphore.withPermits(1)(task);
export const nested = (semaphore: Permit) => semaphore.withPermit(Effect.gen(function* () { yield* Effect.void; return () => Effect.sleep(1); }));
export const namespace = (semaphore: Permit) => Semaphore.withPermit(semaphore, Effect.sync(() => 42));
export const piped = (semaphore: Permit) => Effect.sync(() => 42).pipe(Semaphore.withPermits(semaphore, 1));
