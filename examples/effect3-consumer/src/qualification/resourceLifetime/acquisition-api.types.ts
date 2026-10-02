import { Effect, Layer } from "effect";
import { DatabasePool } from "./pool-support";
import { PoolService } from "./pool-layer";
const acquisition = Effect.acquireRelease(Effect.sync(() => new DatabasePool()), pool => Effect.sync(() => pool.close()));
// @ts-expect-error Acquired resources require a supplied Scope before running.
Effect.runPromise(acquisition);
// @ts-expect-error Legacy Layer.effect does not remove the acquisition's Scope requirement.
const notScoped: Layer.Layer<DatabasePool> = Layer.effect(PoolService, acquisition);
export const valid = Layer.scoped(PoolService, acquisition);
