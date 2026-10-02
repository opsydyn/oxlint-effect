import { Effect, Exit, Scope } from "effect";
export const owned = () => Effect.acquireUseRelease(Scope.make(), scope => Scope.addFinalizer(scope, Effect.void), (scope, exit) => Scope.close(scope, exit));
export const acquired = () => Effect.scoped(Effect.acquireRelease(Scope.make(), (scope, exit) => Scope.close(scope, exit)));
export const explicit = () => Effect.gen(function* () {
  const scope = yield* Scope.make();
  yield* Scope.close(scope, Exit.succeed(undefined));
  return 42;
});
export const supplied = () => Effect.scoped(Effect.gen(function* () {
  const scope = yield* Effect.scope;
  yield* Scope.addFinalizer(scope, Effect.void);
  return 42;
}));
// Syntactic close presence is not execution/dominance proof: this finalizer will not run.
export const lazyClose = () => Effect.gen(function* () {
  const scope = yield* Scope.make();
  Scope.close(scope, Exit.succeed(undefined));
  return scope;
});
