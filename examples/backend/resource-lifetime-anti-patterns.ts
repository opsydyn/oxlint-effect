import { Effect, Exit, Layer, Scope } from "effect";

declare const client: { close: () => void };
declare const fileHandle: { dispose: () => void };
declare const logger: { close: () => void };
declare const existingScope: unknown;
declare const acquireClient: Effect.Effect<unknown, never, never>;
declare const connectClient: () => unknown;
declare const UserService: unknown;
declare class DatabasePool {}

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

// EXPECT: linteffect/no-resource-without-acquire-release
// QA: A client opened in Effect logic needs an acquire/release owner.
export const unownedClient = Effect.gen(function* () {
  const connectedClient = connectClient();
  return connectedClient;
});

// EXPECT: linteffect/no-request-scoped-long-lived-resource
// QA: Request handlers should depend on a Layer-provided client rather than create one per request.
export function requestHandler() {
  const requestClient = connectClient();
  return requestClient;
}

// EXPECT: linteffect/no-global-resource-singleton
// QA: Module-level pools bypass Layer ownership and application shutdown ordering.
const globalPool = new DatabasePool();

// EXPECT: linteffect/no-run-with-open-resource
// QA: Runtime execution should not happen while an unowned resource remains open in the same scope.
export function runWithOpenResource() {
  const openClient = connectClient();
  return Effect.runPromise(Effect.succeed(openClient));
}

// EXPECT: linteffect/no-nested-acquire-release
// QA: Deep release stacks should be replaced by named Layers or smaller ownership boundaries.
export const deeplyNestedResources = Effect.acquireRelease(
  Effect.acquireRelease(
    Effect.acquireRelease(Effect.succeed("resource"), () => Effect.void),
    () => Effect.void,
  ),
  () => Effect.void,
);

// EXPECT: linteffect/no-missing-layer-provision-at-run
// QA: Service tags must be provided before an Effect is run at the application boundary.
export const missingLayerProvision = Effect.runPromise(
  Effect.gen(function* () {
    yield* UserService;
    return "ok";
  }),
);

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

void globalPool;
