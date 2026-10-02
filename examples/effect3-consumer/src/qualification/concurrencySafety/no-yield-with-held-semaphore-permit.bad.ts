import { Deferred, Effect, Queue, TSemaphore } from "effect";
type Permit = Effect.Semaphore;
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const held = <E>(semaphore: Permit, gate: Deferred.Deferred<number, E>, started: Deferred.Deferred<void>) => semaphore.withPermits(1)(Effect.gen(function* () { yield* Deferred.succeed(started, undefined); return yield* Deferred.await(gate); }));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const sleep = (semaphore: Permit) => semaphore.withPermits(1)(Effect.sleep(0));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const promise = (semaphore: Permit) => semaphore.withPermits(1)(Effect.promise(() => Promise.resolve(42)));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const transactional = <E>(semaphore: TSemaphore.TSemaphore, gate: Deferred.Deferred<number, E>) => TSemaphore.withPermit(Deferred.await(gate), semaphore);
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const transactionalCurried = (semaphore: TSemaphore.TSemaphore, queue: Queue.Dequeue<number>) => TSemaphore.withPermit(semaphore)(Queue.take(queue));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const transactionalMany = (semaphore: TSemaphore.TSemaphore) => TSemaphore.withPermits(Effect.promise(() => Promise.resolve(42)), semaphore, 1);
