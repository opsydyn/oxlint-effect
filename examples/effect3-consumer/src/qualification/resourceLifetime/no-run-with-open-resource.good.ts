import { Effect } from "effect";
import { DatabasePool, openConnection } from "./pool-support";
export const owned = () => Effect.runPromise(Effect.acquireUseRelease(Effect.sync(() => openConnection()), client => Effect.sync(() => client.read()), client => Effect.sync(() => client.close())));
export const scoped = () => Effect.runSync(Effect.scoped(Effect.acquireRelease(Effect.sync(() => openConnection()), client => Effect.sync(() => client.close()))));
export const gated = <E>(wait: Effect.Effect<number, E>) => Effect.runPromiseExit(Effect.acquireUseRelease(Effect.sync(() => openConnection()), client => Effect.map(wait, delta => client.read() + delta), client => Effect.sync(() => client.close())));
// Aliased factory bodies remain opaque; external teardown is still required.
const makeValue = () => new DatabasePool();
export function opaque() { const value = makeValue(); return Effect.runSync(Effect.succeed(value)); }
