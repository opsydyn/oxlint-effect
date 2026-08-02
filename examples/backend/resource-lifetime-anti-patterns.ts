import { Effect, Exit, Layer, Scope } from "effect";

declare const client: { close: () => void };
declare const fileHandle: { dispose: () => void };
declare const logger: { close: () => void };
declare const existingScope: unknown;
declare const acquireClient: Effect.Effect<unknown, never, never>;

// EXPECT: linteffect/no-manual-resource-close
// QA: Direct cleanup bypasses Effect's release ownership.
export const manualClose = Effect.gen(function* () {
  client.close();
});

// EXPECT: linteffect/no-manual-resource-close
// QA: Manual disposal of a resource-like handle should use a release callback.
export const manualDispose = Effect.gen(function* () {
  fileHandle.dispose();
});

// EXPECT: linteffect/no-unbound-scope
// QA: Scope.make is created without scoped ownership or a matching close.
export const leakedScope = Effect.gen(function* () {
  const scope = yield* Scope.make();
  return scope;
});

// EXPECT: linteffect/no-resource-succeed-escape
// QA: A live client escapes as an ordinary success value.
export const escapedClient = Effect.succeed(client);

export const managedClient = Effect.acquireRelease(
  acquireClient,
  () => Effect.sync(() => client.close()),
);

export const managedClientWithUse = Effect.acquireUseRelease(
  acquireClient,
  (value) => Effect.succeed(value),
  () => Effect.sync(() => client.close()),
);

export const interruptiblyManagedClient = Effect.acquireReleaseInterruptible(
  acquireClient,
  () => Effect.sync(() => client.close()),
);

export const finalizerOwnedClient = Effect.addFinalizer(
  () => Effect.sync(() => client.close()),
);

export const scopeFinalizerOwnedClient = Scope.addFinalizer(
  existingScope,
  () => Effect.sync(() => client.close()),
);

export const scopeExitFinalizerOwnedClient = Scope.addFinalizerExit(
  existingScope,
  () => Effect.sync(() => client.close()),
);

export const explicitlyClosedScope = Effect.gen(function* () {
  const scope = yield* Scope.make();
  yield* Scope.close(scope, Exit.void);
});

export const scopedScope = Effect.scoped(Effect.gen(function* () {
  const scope = yield* Scope.make();
  return scope;
}));

export const layerScopedScope = Layer.scoped(Effect.gen(function* () {
  const scope = yield* Scope.make();
  return scope;
}));

export const unrelatedClose = logger.close();
export const ordinarySuccess = Effect.succeed("ok");
