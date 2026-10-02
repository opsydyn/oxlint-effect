import { Effect } from "effect";
import { openConnection, connectClient, createPool, startServer, listenSocket, subscribeStream, acquireHandle, vendor } from "./pool-support";
// @lint-expect linteffect/no-resource-without-acquire-release
export const open = () => Effect.sync(() => openConnection());
// @lint-expect linteffect/no-resource-without-acquire-release
export const connect = () => Effect.sync(() => connectClient());
// @lint-expect linteffect/no-resource-without-acquire-release
export const create = () => Effect.sync(() => createPool());
// @lint-expect linteffect/no-resource-without-acquire-release
export const start = () => Effect.sync(() => startServer());
// @lint-expect linteffect/no-resource-without-acquire-release
export const listen = () => Effect.sync(() => listenSocket());
// @lint-expect linteffect/no-resource-without-acquire-release
export const subscribe = () => Effect.sync(() => subscribeStream());
// @lint-expect linteffect/no-resource-without-acquire-release
export const acquire = () => Effect.sync(() => acquireHandle());
// @lint-expect linteffect/no-resource-without-acquire-release
export const member = () => Effect.sync(() => vendor.openConnection());
