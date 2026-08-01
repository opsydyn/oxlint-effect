import { Effect, Exit, Layer, Scope } from "effect";

declare const client: { close: () => void };
declare const logger: { close: () => void };
declare const acquireClient: Effect.Effect<unknown, never, never>;

export const manuallyClosed = Effect.gen(function* () {
  client.close();
});

export const unbound = Effect.gen(function* () {
  const scope = yield* Scope.make();
  return scope;
});

export const escaped = Effect.succeed(client);

export const managed = Effect.acquireRelease(
  acquireClient,
  () => Effect.sync(() => client.close()),
);

export const scoped = Effect.scoped(Effect.gen(function* () {
  const scope = yield* Scope.make();
  return scope;
}));

export const explicitlyClosed = Effect.gen(function* () {
  const scope = yield* Scope.make();
  yield* Scope.close(scope, Exit.void);
});

export const layerScoped = Layer.scoped(Effect.gen(function* () {
  const scope = yield* Scope.make();
  return scope;
}));

export const finalizerOwned = Effect.addFinalizer(() => client.close());
export const unrelatedClose = logger.close();
export const ordinarySuccess = Effect.succeed("ok");
