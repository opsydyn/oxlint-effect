import { Effect, SynchronizedRef, TSemaphore } from "effect";

declare const semaphore: Effect.Semaphore;
declare const synchronizedRef: SynchronizedRef.SynchronizedRef<number>;
declare const tSemaphore: TSemaphore.TSemaphore;
declare const scope: unknown;
declare const supervisor: unknown;

export const heldPermitSleep = semaphore.withPermits(1)(Effect.sleep("1 second"));
export const safePermitSync = semaphore.withPermits(1)(Effect.sync(() => "ok"));
export const heldRefSleep = SynchronizedRef.modifyEffect(
  synchronizedRef,
  () => Effect.sleep("1 second").pipe(Effect.as([0, 0] as const)),
);
export const safeRefUpdate = SynchronizedRef.update(synchronizedRef, (value) => value + 1);
export const heldTsyncAwait = TSemaphore.withPermit(
  Effect.await("deferred"),
  tSemaphore,
);
export const daemonWorker = Effect.forkDaemon(Effect.sync(() => "daemon"));
export const supervisedDaemon = Effect.forkDaemon(
  Effect.supervised(Effect.sync(() => "supervised"), supervisor),
);
export const scopedWorker = Effect.forkScoped(Effect.sync(() => "scoped"));
export const inScopeWorker = Effect.forkIn(Effect.sync(() => "in-scope"), scope);
