import { Deferred, Effect } from "effect";

declare const openConnection: () => Effect.Effect<unknown, never, never>;
declare const createClient: () => Effect.Effect<unknown, never, never>;
declare const releaseClient: (client: unknown) => Effect.Effect<void, never, never>;

export const unboundedReadyLatch = Effect.gen(function* () {
  const ready = yield* Deferred.make<void>();
  return yield* Deferred.await(ready);
});

export const unscopedConnectionWorker = Effect.fork(openConnection());

export const unscopedClientFanout = Effect.all([
  Effect.promise(() => createClient()),
]);

export const boundedReadyLatch = Effect.gen(function* () {
  const ready = yield* Deferred.make<void>();
  return yield* Effect.timeout(Deferred.await(ready), "1 second");
});

export const scopedConnectionWorker = Effect.fork(
  Effect.scoped(openConnection()),
);

export const bracketedClientWorker = Effect.fork(
  Effect.acquireRelease(createClient(), releaseClient),
);
