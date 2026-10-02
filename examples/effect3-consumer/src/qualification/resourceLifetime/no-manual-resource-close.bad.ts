import { Effect, Scope } from "effect";
import type { Client } from "./support";
// @lint-expect linteffect/no-manual-resource-close
export const close = (client: Client) => Effect.sync(() => client.close());
// @lint-expect linteffect/no-manual-resource-close
export const destroy = (client: Client) => Effect.sync(() => client.destroy());
// @lint-expect linteffect/no-manual-resource-close
export const dispose = (client: Client) => Effect.sync(() => client.dispose());
// @lint-expect linteffect/no-manual-resource-close
export const cleanup = (client: Client) => Effect.sync(() => client.cleanup());
// @lint-expect linteffect/no-manual-resource-close: the use callback is not release.
export const prematurelyClosed = (client: Client) => Effect.acquireUseRelease(Effect.succeed(client), client => Effect.sync(() => { client.close(); return client.value; }), client => Effect.sync(() => client.close()));
// @lint-expect linteffect/no-manual-resource-close: retained legacy effect-valued-finalizer false positive.
export const registered = (scope: Scope.Scope, client: Client) => Scope.addFinalizer(scope, Effect.sync(() => client.close()));
// @lint-expect linteffect/no-manual-resource-close: retained legacy curried-release false positive.
export const curried = (client: Client) => Effect.scoped(Effect.succeed(client).pipe(Effect.acquireRelease(client => Effect.sync(() => client.close()))));
