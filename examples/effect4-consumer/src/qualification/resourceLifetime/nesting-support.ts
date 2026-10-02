import { Effect } from "effect";
import { DatabasePool } from "./pool-support";
export const releases: string[] = [];
export const acquire = () => Effect.sync(() => new DatabasePool());
export const release = (label: string, pool: DatabasePool) => Effect.sync(() => { pool.close(); releases.push(label); });
export type Use<E> = (pools: readonly DatabasePool[]) => Effect.Effect<number, E>;
