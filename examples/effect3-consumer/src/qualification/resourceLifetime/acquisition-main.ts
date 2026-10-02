import { Effect } from "effect";
import { DatabasePool, openConnection } from "./pool-support";
// A dedicated boundary probe uses custom boundaryPaths in the packed harness.
export const scope = () => Effect.sync(() => openConnection());
export function requestHandler() { return new DatabasePool(); }
export const global = new DatabasePool();
