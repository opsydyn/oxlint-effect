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
