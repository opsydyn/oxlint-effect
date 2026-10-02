import { Deferred, Effect, Option, SubscriptionRef, SynchronizedRef } from "effect";
type Ref = SynchronizedRef.SynchronizedRef<number>;
// @lint-expect linteffect/no-yield-with-held-mutable-ref: unrelated wait owns the ref lock.
export const held = <E>(ref: Ref, gate: Deferred.Deferred<number, E>, started: Deferred.Deferred<void>) => SynchronizedRef.updateEffect(ref, value => Effect.gen(function* () { yield* Deferred.succeed(started, undefined); const delta = yield* Deferred.await(gate); return value + delta; }));
// @lint-expect linteffect/no-yield-with-held-mutable-ref
export const modify = (ref: Ref) => SynchronizedRef.modifyEffect(ref, value => Effect.map(Effect.promise(() => Promise.resolve(1)), delta => [42, value + delta] as const));
// @lint-expect linteffect/no-yield-with-held-mutable-ref
export const partial = (ref: Ref) => SynchronizedRef.modifySomeEffect(ref, 42, value => Option.some(Effect.map(Effect.promise(() => Promise.resolve(1)), delta => [42, value + delta] as const)));
// @lint-expect linteffect/no-yield-with-held-mutable-ref
export const updateAndGet = (ref: Ref) => SynchronizedRef.updateAndGetEffect(ref, value => Effect.as(Effect.sleep(0), value + 1));
// @lint-expect linteffect/no-yield-with-held-mutable-ref
export const curried = (ref: Ref) => SynchronizedRef.updateEffect((value: number) => Effect.as(Effect.sleep(0), value + 1))(ref);
// @lint-expect linteffect/no-yield-with-held-mutable-ref
export const subscription = (ref: SubscriptionRef.SubscriptionRef<number>) => SubscriptionRef.updateEffect(ref, value => Effect.as(Effect.sleep(0), value + 1));
// @lint-expect linteffect/no-yield-with-held-mutable-ref: legacy instance API.
export const instance = (ref: Ref) => ref.modifyEffect(value => Effect.map(Effect.promise(() => Promise.resolve(1)), delta => [42, value + delta] as const));
