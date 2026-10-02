import { Effect, Scope } from "effect";
import type { Client } from "./support";
export const owned = (client: Client) => Effect.acquireUseRelease(Effect.succeed(client), client => Effect.succeed(client.value), client => Effect.sync(() => client.close()));
export const scoped = (client: Client) => Effect.scoped(Effect.acquireRelease(Effect.succeed(client), client => Effect.sync(() => client.dispose())));
export const finalizer = (client: Client) => Effect.scoped(Effect.addFinalizer(() => Effect.sync(() => client.cleanup())));
export const exitFinalizer = (scope: Scope.Scope, client: Client) => Scope.addFinalizerExit(scope, () => Effect.sync(() => client.destroy()));
export const registered = (scope: Scope.Scope, client: Client) => Scope.addFinalizer(scope, Effect.sync(() => client.close()));
export const deferred = (scope: Scope.Scope, client: Client) => Scope.addFinalizer(scope, Effect.suspend(() => Effect.sync(() => client.close())));
export const interruptible = (client: Client) => Effect.scoped(Effect.acquireRelease(Effect.succeed(client), client => Effect.sync(() => client.close()), { interruptible: true }));
export const unrelated = (logger: { close(): void }) => Effect.sync(() => logger.close());
// Named callbacks and computed methods are intentionally outside literal ownership inference.
export const computed = (client: Client) => Effect.sync(() => client["close"]());
