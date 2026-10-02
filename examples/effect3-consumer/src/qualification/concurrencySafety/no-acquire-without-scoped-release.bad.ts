import { Deferred, Effect, Scope } from "effect";
import { openConnection, type Connection } from "./lifetime-support";
type Open = (connection: Connection) => void;
// @lint-expect linteffect/no-acquire-without-scoped-release
export const fork = <E>(onOpen: Open, gate: Deferred.Deferred<number, E>) => Effect.fork(Effect.gen(function* () { const connection = yield* openConnection(onOpen); return connection.value + (yield* Deferred.await(gate)); }));
// @lint-expect linteffect/no-acquire-without-scoped-release: a scoped fiber does not register resource cleanup by itself.
export const scoped = (onOpen: Open) => Effect.forkScoped(openConnection(onOpen));
// @lint-expect linteffect/no-acquire-without-scoped-release
export const detached = (onOpen: Open) => Effect.forkDaemon(openConnection(onOpen));
// @lint-expect linteffect/no-acquire-without-scoped-release
export const all = (onOpen: Open) => Effect.all([1].map(() => openConnection(onOpen)), { concurrency: 1 });
// @lint-expect linteffect/no-acquire-without-scoped-release
export const forEach = (onOpen: Open) => Effect.forEach([1], () => openConnection(onOpen));
// @lint-expect linteffect/no-acquire-without-scoped-release
export const race = (onOpen: Open) => Effect.race(openConnection(onOpen), Effect.never);
// @lint-expect linteffect/no-acquire-without-scoped-release
export const raceFirst = (onOpen: Open) => Effect.raceFirst(openConnection(onOpen), Effect.never);
// @lint-expect linteffect/no-acquire-without-scoped-release
export const raceAll = (onOpen: Open) => Effect.raceAll([openConnection(onOpen), Effect.never]);
