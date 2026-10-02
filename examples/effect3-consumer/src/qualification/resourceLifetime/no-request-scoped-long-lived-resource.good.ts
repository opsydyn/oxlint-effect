import { Effect } from "effect";
import { DatabasePool, openConnection } from "./pool-support";
import { PoolService } from "./pool-layer";
// Real repair: read the application-owned service without per-request construction.
export const requestHandler = () => Effect.gen(function* () { const client = yield* PoolService; return client.read(); });
export const endpoint = () => Effect.map(PoolService, client => client.read());
export const route = () => Effect.gen(function* () {
  const unused = () => openConnection();
  void unused;
  const client = yield* PoolService;
  return client.read();
});
// Naming/opaque-flow controls are lint-clean, not lifetime repairs.
export const ordinary = () => new DatabasePool();
export const request = (factory: () => DatabasePool) => factory();
export const captured = (value: DatabasePool) => ({ handler: () => value.read() });
