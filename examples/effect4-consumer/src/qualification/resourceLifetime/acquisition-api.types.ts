import { Effect, Layer } from "effect";
import { DatabasePool } from "./pool-support";
import { PoolService } from "./pool-layer";
const acquisition = Effect.acquireRelease(Effect.sync(() => new DatabasePool()), pool => Effect.sync(() => pool.close()));
// @ts-expect-error Acquired resources require a supplied Scope before running.
Effect.runPromise(acquisition);
// @ts-expect-error Removed legacy layer acquisition form.
Layer.scoped(PoolService, acquisition);
export const valid = Layer.effect(PoolService, acquisition);
