import { Deferred, Effect, SynchronizedRef } from "effect";
type Ref = SynchronizedRef.SynchronizedRef<number>;
// Repair only an independent delta; a state-dependent effect cannot be split mechanically.
export const narrowed = <E>(ref: Ref, gate: Deferred.Deferred<number, E>, started: Deferred.Deferred<void>) => Effect.gen(function* () { yield* Deferred.succeed(started, undefined); const delta = yield* Deferred.await(gate); yield* SynchronizedRef.update(ref, value => value + delta); });
export const sync = (ref: Ref) => SynchronizedRef.update(ref, value => value + 1);
export const quick = (ref: Ref) => SynchronizedRef.updateEffect(ref, value => Effect.succeed(value + 1));
// Named effect bodies remain outside this syntax check.
export const opaque = (ref: Ref, task: (value: number) => Effect.Effect<number>) => SynchronizedRef.updateEffect(ref, task);
