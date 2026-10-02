import { Deferred, Effect, Queue, Semaphore } from "effect";
type Permit = Semaphore.Semaphore;
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const held = <E>(semaphore: Permit, gate: Deferred.Deferred<number, E>, started: Deferred.Deferred<void>) => semaphore.withPermits(1)(Effect.gen(function* () { yield* Deferred.succeed(started, undefined); return yield* Deferred.await(gate); }));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const sleep = (semaphore: Permit) => semaphore.withPermits(1)(Effect.sleep(0));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const promise = (semaphore: Permit) => semaphore.withPermits(1)(Effect.promise(() => Promise.resolve(42)));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const instance = <E>(semaphore: Permit, gate: Deferred.Deferred<number, E>) => semaphore.withPermit(Deferred.await(gate));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const namespace = <E>(semaphore: Permit, gate: Deferred.Deferred<number, E>) => Semaphore.withPermit(semaphore, Deferred.await(gate));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const namespaceMany = (semaphore: Permit, queue: Queue.Dequeue<number>) => Semaphore.withPermits(semaphore, 1, Queue.take(queue));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const piped = <E>(semaphore: Permit, gate: Deferred.Deferred<number, E>) => Deferred.await(gate).pipe(Semaphore.withPermit(semaphore));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const curried = <E>(semaphore: Permit, gate: Deferred.Deferred<number, E>) => Semaphore.withPermits(semaphore, 1)(Deferred.await(gate));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const child = (semaphore: Permit) => Semaphore.withPermit(semaphore, Effect.forkChild(Effect.succeed(42)));
// @lint-expect linteffect/no-yield-with-held-semaphore-permit
export const traced = (semaphore: Permit) => Semaphore.withPermit(semaphore, Effect.fn("held")(function* () { return yield* Effect.promise(() => Promise.resolve(42)); })());
