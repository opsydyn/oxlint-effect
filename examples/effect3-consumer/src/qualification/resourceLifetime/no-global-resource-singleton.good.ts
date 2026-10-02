import { Effect } from "effect";
import { DatabasePool } from "./pool-support";
export { PoolLive, PoolService } from "./pool-layer";
// Construction in a lazy factory is not a module singleton.
export const construction = Effect.sync(() => new DatabasePool());
// Aliased constructors remain opaque; this is a clean counterexample, not repair.
const Value = DatabasePool;
export const aliased = new Value();
export const plain = { value: 42 };
export const local = () => new DatabasePool();
