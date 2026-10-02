import { Deferred, Effect } from "effect";
type Ready<E> = (deferred: Deferred.Deferred<number, E>) => void;
// @lint-expect linteffect/no-manual-deferred-coordination
export const made = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); return yield* Deferred.await(ready); });
// @lint-expect linteffect/no-manual-deferred-coordination
export const unsafe = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = Deferred.makeUnsafe<number, E>(); onReady(ready); return yield* Deferred.await(ready); });
// @lint-expect linteffect/no-manual-deferred-coordination
export const unprotectedPipe = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); return yield* Deferred.await(ready).pipe(Effect.map(value => value)); });
// @lint-expect linteffect/no-manual-deferred-coordination: captured lexical binding.
export const captured = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); const wait = () => Deferred.await(ready); return yield* wait(); });
// @lint-expect linteffect/no-manual-deferred-coordination: finalizer references a different ready.
export const shadow = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); const unused = () => { const ready = Deferred.makeUnsafe<number>(); return Effect.addFinalizer(() => Deferred.interrupt(ready)); }; void unused; return yield* Deferred.await(ready); });
// @lint-expect linteffect/no-manual-deferred-coordination: timeout only protects the source.
export const fallbackWait = <E>(onReady: Ready<E>) => Effect.gen(function* () { const ready = yield* Deferred.make<number, E>(); onReady(ready); return yield* Effect.timeoutOrElse(Effect.never, { duration: 0, orElse: () => Deferred.await(ready) }); });
