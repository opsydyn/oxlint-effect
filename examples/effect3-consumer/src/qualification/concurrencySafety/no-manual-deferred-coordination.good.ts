import { Deferred, Effect } from "effect";
type Ready<E> = (deferred: Deferred.Deferred<number, E>) => void;
export const bounded = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); return yield* Effect.timeout(Deferred.await(ready), "1 second"); });
export const race = <E>(onReady: Ready<E>, fallback: Effect.Effect<number, E>) => Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); return yield* Effect.raceFirst(Deferred.await(ready), fallback); });
export const finalized = <E>(onReady: Ready<E>) => Effect.scoped(Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); yield* Effect.addFinalizer(() => Deferred.interrupt(ready)); onReady(ready); return yield* Deferred.await(ready); }));
// Clean marker limit: scope/interruptible alone does not complete a latch.
export const markerOnly = <E>(onReady: Ready<E>) => Effect.scoped(Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); return yield* Deferred.await(ready); }));
