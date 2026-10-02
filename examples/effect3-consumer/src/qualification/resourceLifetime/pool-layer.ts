import { Context, Effect, Layer } from "effect";
import { DatabasePool } from "./pool-support";
export const PoolService = Context.GenericTag<DatabasePool>("Q23Pool");
export const PoolLive = Layer.scoped(PoolService, Effect.acquireRelease(Effect.sync(() => new DatabasePool()), pool => Effect.sync(() => pool.close())));
