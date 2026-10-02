import { Effect } from "effect";
import { openConnection, DatabasePool } from "./pool-support";
export const owned = () => Effect.acquireUseRelease(Effect.sync(() => openConnection()), client => Effect.sync(() => client.read()), client => Effect.sync(() => client.close()));
export const acquired = () => Effect.scoped(Effect.acquireRelease(Effect.sync(() => openConnection()), client => Effect.sync(() => client.close())));
export const interruptible = () => Effect.gen(function* () {
  let client: DatabasePool | undefined;
  return yield* Effect.scoped(Effect.acquireReleaseInterruptible(Effect.sync(() => { client = openConnection(); return client; }), () => Effect.sync(() => client?.close())));
});
// Preserved scope marker exclusion, not a repair: this raw resource still needs teardown.
export const markerOnly = () => Effect.scoped(Effect.sync(() => openConnection()));
export const pipeMarker = () => Effect.sync(() => openConnection()).pipe(Effect.scoped);
export const named = (acquisition: Effect.Effect<DatabasePool>) => acquisition;
export const generic = () => Effect.sync(() => makeValue());
function makeValue() { return new DatabasePool(); }
export const computed = () => Effect.sync(() => ({ openConnection })["openConnection"]());
