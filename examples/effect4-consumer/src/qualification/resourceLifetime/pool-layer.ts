import { Context, Effect, Layer } from "effect";
import { DatabasePool } from "./pool-support";
export const PoolService = Context.Service<DatabasePool>("Q23Pool");
export const PoolLive = Layer.effect(PoolService, Effect.acquireRelease(Effect.sync(() => new DatabasePool()), pool => Effect.sync(() => pool.close())));
