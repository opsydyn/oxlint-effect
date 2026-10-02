import { Deferred, Effect, FiberId } from "effect";
type Ready<E> = (deferred: Deferred.Deferred<number, E>) => void;
// @lint-expect linteffect/no-manual-deferred-coordination
export const made = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); return yield* Deferred.await(ready); });
// @lint-expect linteffect/no-manual-deferred-coordination
export const unsafe = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = Deferred.unsafeMake<number, E>(FiberId.none); onReady(ready); return yield* Deferred.await(ready); });
// @lint-expect linteffect/no-manual-deferred-coordination
export const unprotectedPipe = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); return yield* Deferred.await(ready).pipe(Effect.map(value => value)); });
