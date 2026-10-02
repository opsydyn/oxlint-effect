import { Effect, Exit, Scope } from "effect";
// @lint-expect linteffect/no-unbound-scope
export const unowned = () => Scope.make();
export const wrongScope = (other: Scope.Scope.Closeable) => Effect.gen(function* () {
  // @lint-expect linteffect/no-unbound-scope
  const scope = yield* Scope.make();
  yield* Scope.close(other, Exit.succeed(undefined));
  return scope;
});
export const nestedClose = () => Effect.gen(function* () {
  // @lint-expect linteffect/no-unbound-scope: nested function does not confer local ownership.
  const scope = yield* Scope.make();
  const later = () => Scope.close(scope, Exit.succeed(undefined));
  return later;
});
export const shadowed = (other: Scope.Scope.Closeable) => Effect.gen(function* () {
  // @lint-expect linteffect/no-unbound-scope
  const scope = yield* Scope.make();
  { const scope = other; yield* Scope.close(scope, Exit.succeed(undefined)); }
  return scope;
});
