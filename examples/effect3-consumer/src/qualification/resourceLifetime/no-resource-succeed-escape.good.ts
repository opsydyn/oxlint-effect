import { Effect } from "effect";
import { makeClient, type Client } from "./support";
export const data = () => Effect.acquireUseRelease(Effect.sync(makeClient), client => Effect.sync(() => client.value), client => Effect.sync(() => client.close()));
// Generic aliases remain opaque; this is a lint-clean counterexample, not a repair.
export const alias = (value: Client) => Effect.succeed(value);
export const immutable = () => Effect.succeed({ value: 42 });
