import { Effect } from "effect";

declare const userIds: ReadonlyArray<string>;
declare const sendNotification: (userId: string) => Effect.Effect<void, never, never>;
declare const auditProgram: Effect.Effect<void, never, never>;
declare const fastProgram: Effect.Effect<string, never, never>;
declare const slowProgram: Effect.Effect<string, never, never>;

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
