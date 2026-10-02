import { Effect } from "effect";
import { acquire, release, type Use } from "./nesting-support";
import type { DatabasePool } from "./pool-support";
// Named composition preserves acquisition/release order rather than flattening partial acquisition.
const withFirst = <E>(use: (pool: DatabasePool) => Effect.Effect<number, E>) => Effect.acquireUseRelease(acquire(), use, pool => release("first", pool));
const withSecond = <E>(use: (pool: DatabasePool) => Effect.Effect<number, E>) => Effect.acquireUseRelease(acquire(), use, pool => release("second", pool));
const withThird = <E>(use: (pool: DatabasePool) => Effect.Effect<number, E>) => Effect.acquireUseRelease(acquire(), use, pool => release("third", pool));
export const composed = <E>(use: Use<E>) => withFirst(first => withSecond(second => withThird(third => use([first, second, third]))));
export const two = () => Effect.acquireUseRelease(acquire(), () => Effect.acquireUseRelease(acquire(), () => Effect.succeed(42), pool => release("second", pool)), pool => release("first", pool));
export const separate = () => Effect.all([withFirst(pool => Effect.succeed(pool.value)), withSecond(pool => Effect.succeed(pool.value))]);
