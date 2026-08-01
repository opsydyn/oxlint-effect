import { Deferred, Effect, Queue, SynchronizedRef } from "effect";

declare const userIds: ReadonlyArray<string>;
declare const sendNotification: (userId: string) => Effect.Effect<void, never, never>;
declare const auditProgram: Effect.Effect<void, never, never>;
declare const fastProgram: Effect.Effect<string, never, never>;
declare const slowProgram: Effect.Effect<string, never, never>;
declare const fs: { readonly readFileSync: (path: string) => string };
declare const fetchProfile: () => Promise<string>;
declare const semaphore: Effect.Semaphore;
declare const synchronizedRef: SynchronizedRef.SynchronizedRef<number>;
declare const scope: unknown;
declare const supervisor: unknown;
declare const openConnection: () => Effect.Effect<unknown, never, never>;
declare const createClient: () => Effect.Effect<unknown, never, never>;
declare const releaseClient: (client: unknown) => Effect.Effect<void, never, never>;

// EXPECT: linteffect/no-unbounded-effect-all
// QA: Mapping a whole collection into Effect.all should declare a concurrency limit.
export const unboundedNotifications = Effect.all(
  userIds.map((userId) => sendNotification(userId)),
);

// EXPECT: linteffect/no-fire-and-forget-fork
// QA: Bare Effect.fork statements detach failures and lifecycle ownership.
Effect.fork(auditProgram);

// EXPECT: linteffect/no-fork-in-loop
// QA: Forking inside loops creates unbounded concurrency and unclear ownership.
for (const userId of userIds) {
  Effect.fork(sendNotification(userId));
}

// EXPECT: linteffect/no-race-without-cleanup
// QA: Racing effects should make loser cleanup or scoped ownership explicit.
export const raceWithoutCleanup = Effect.race(fastProgram, slowProgram);

// EXPECT: linteffect/no-unobserved-fiber
// QA: Forked fibers should be joined, awaited, interrupted, or scoped.
export const unobservedWorker = Effect.fork(auditProgram);

// EXPECT: linteffect/no-unbounded-concurrent-retry
// QA: Retry inside unbounded parallel collection work can amplify load.
export const retryStorm = Effect.all(
  userIds.map((userId) => Effect.retry(sendNotification(userId))),
);

// EXPECT: linteffect/no-blocking-call-in-effect
// QA: Blocking sync calls inside Effect logic should be moved to platform adapters or async boundaries.
export const blockingSessionRead = Effect.sync(() => fs.readFileSync("/tmp/session.json"));

// EXPECT: linteffect/no-promise-concurrency-in-effect
// QA: Promise concurrency bypasses Effect scheduling, interruption, tracing, and error channels.
export const promiseFanout = Effect.gen(function* () {
  Promise.allSettled(userIds.map((userId) => Promise.resolve(userId)));
});

let completedNotifications = 0;

// EXPECT: linteffect/no-shared-mutable-state-across-fibers
// QA: Shared mutable state in parallel work should use Ref/SynchronizedRef/Queue or immutable aggregation.
export const sharedCounterAcrossFibers = Effect.all(
  userIds.map((userId) => Effect.sync(() => {
    completedNotifications++;
    return userId;
  })),
  { concurrency: 4 },
);

// EXPECT: linteffect/no-timeout-with-noninterruptible-promise
// QA: Timeout around Promise interop should wire cancellation into the underlying async operation.
export const timedOutNoninterruptiblePromise = Effect.timeout(
  Effect.promise(() => fetchProfile()),
  "1 second",
);

// EXPECT: linteffect/no-uninterruptible-concurrent-region
// QA: broad uninterruptible regions should not wrap concurrent work.
export const uninterruptibleFanout = Effect.uninterruptible(
  Effect.all(userIds.map((userId) => sendNotification(userId))),
);

// EXPECT: linteffect/no-unbounded-queue-or-pubsub
// QA: Queue/PubSub capacity should be explicit at the owning boundary.
export const unboundedNotificationQueue = Queue.unbounded<string>();

const globalNotificationCache = new Map<string, number>();

// EXPECT: linteffect/no-global-mutable-concurrency-state
// QA: global mutable containers should not be touched from concurrent Effect work.
export const globalMutableCacheWrites = Effect.all(
  userIds.map((userId) => Effect.sync(() => globalNotificationCache.set(userId, userId.length))),
  { concurrency: 4 },
);

// EXPECT: linteffect/no-yield-with-held-semaphore-permit
// QA: A permit should protect a short synchronous state transition, not a sleeping effect.
export const permitHeldAcrossSleep = semaphore.withPermit(Effect.sleep("1 second"));

// EXPECT: linteffect/no-yield-with-held-mutable-ref
// QA: SynchronizedRef effect modifiers should not hold coordination while starting concurrent work.
export const synchronizedRefHeldAcrossFork = SynchronizedRef.modifyEffect(
  synchronizedRef,
  () => Effect.forkScoped(Effect.sync(() => "work")).pipe(Effect.as([0, 0] as const)),
);

// EXPECT: linteffect/no-unscoped-background-fiber
// QA: Daemon fibers detach from the caller's scope and need explicit ownership.
export const unscopedDaemonWorker = Effect.forkDaemon(Effect.sync(() => "daemon"));

// EXPECT: linteffect/no-manual-deferred-coordination
// QA: Local Deferred latches should have a bounded wait or explicit ownership.
export const unboundedReadyLatch = Effect.gen(function* () {
  const ready = yield* Deferred.make<void>();
  return yield* Deferred.await(ready);
});

// EXPECT: linteffect/no-acquire-without-scoped-release
// QA: Concurrent resource acquisition should be bracketed by scoped release ownership.
export const unscopedConnectionWorker = Effect.fork(openConnection());

export const scopedConnectionWorker = Effect.fork(
  Effect.scoped(openConnection()),
);

export const bracketedClientWorker = Effect.fork(
  Effect.acquireRelease(createClient(), releaseClient),
);

export const boundedReadyLatch = Effect.gen(function* () {
  const ready = yield* Deferred.make<void>();
  return yield* Effect.timeout(Deferred.await(ready), "1 second");
});

export const safePermitCriticalSection = semaphore.withPermit(Effect.sync(() => "ok"));
export const safeSynchronizedRefUpdate = SynchronizedRef.update(
  synchronizedRef,
  (value) => value + 1,
);
export const safeScopedWorker = Effect.forkScoped(Effect.sync(() => "scoped"));
export const safeInWorker = Effect.forkIn(Effect.sync(() => "in-scope"), scope);
export const supervisedDaemonWorker = Effect.forkDaemon(
  Effect.supervised(Effect.sync(() => "supervised"), supervisor),
);
