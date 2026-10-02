import { Deferred, Effect } from "effect";
import { openConnection, type Connection } from "./lifetime-support";
type Open = (connection: Connection) => void;
export const owned = <E>(onOpen: Open, gate: Deferred.Deferred<number, E>, release: (connection: Connection) => Effect.Effect<void>) => Effect.fork(Effect.acquireUseRelease(openConnection(onOpen), connection => Effect.map(Deferred.await(gate), delta => connection.value + delta), release));
export const scopedAcquire = (onOpen: Open) => Effect.fork(Effect.scoped(Effect.acquireRelease(openConnection(onOpen), connection => connection.close())));
export const finalized = (onOpen: Open) => Effect.fork(Effect.scoped(Effect.gen(function* () { const connection = yield* openConnection(onOpen); yield* Effect.addFinalizer(() => connection.close()); return connection.value; })));
// Known marker limit: a bare scope does not register release of this resource.
export const markerOnly = (onOpen: Open) => Effect.fork(Effect.scoped(openConnection(onOpen)));
// Naming is a heuristic, not resource-type inference.
export const opaque = (task: Effect.Effect<Connection>) => Effect.fork(task);
