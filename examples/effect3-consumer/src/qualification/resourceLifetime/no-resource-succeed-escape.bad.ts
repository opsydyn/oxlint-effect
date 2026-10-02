import { Effect } from "effect";
import { makeClient, type Client } from "./support";
// @lint-expect linteffect/no-resource-succeed-escape
export const escaped = (client: Client) => Effect.succeed(client);
// @lint-expect linteffect/no-resource-succeed-escape
export const nested = (state: { client: Client }) => Effect.succeed(state.client);
// @lint-expect linteffect/no-resource-succeed-escape
export const pool = (pool: Client) => Effect.succeed(pool);
// @lint-expect linteffect/no-resource-succeed-escape: immutable data still inherits the receiver's resource name.
export const dataField = (client: Client) => Effect.succeed(client.value);
// @lint-expect linteffect/no-resource-succeed-escape: retained strict warning even inside owned use.
export const ownedUse = (client: Client) => Effect.acquireUseRelease(Effect.succeed(42), () => Effect.succeed(client), () => Effect.void);
export const scopedEscape = () => Effect.scoped(Effect.gen(function* () {
  const client = yield* Effect.acquireRelease(Effect.sync(makeClient), client => Effect.sync(() => client.close()));
  // @lint-expect linteffect/no-resource-succeed-escape: the returned handle is already closed.
  return yield* Effect.succeed(client);
}));
