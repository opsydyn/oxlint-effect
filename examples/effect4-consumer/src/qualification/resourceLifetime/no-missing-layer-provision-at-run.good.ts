import { Context, Effect } from "effect";
import { PoolLive, PoolService } from "./pool-layer";
import type { DatabasePool } from "./pool-support";
export const owned = () => Effect.runPromise(Effect.provide(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }), PoolLive));
const program = Effect.provide(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }), PoolLive);
export const named = () => Effect.runPromise(program);
export const piped = () => Effect.runPromise(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }).pipe(Effect.provide(PoolLive)));
export const two = () => Effect.runPromise(Effect.provide(Effect.gen(function* () { const client = yield* PoolService; return [client.read(), client.read()]; }), PoolLive));
export const plain = () => Effect.runPromise(Effect.succeed(42));
export const factory = () => Effect.runPromiseWith(Context.empty());
export const contextual = () => Effect.runPromiseWith(Context.empty())(Effect.provide(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }), PoolLive));
// Syntactic provision presence is not completeness or execution proof.
export const markerOnly = (context: Context.Context<DatabasePool>) => Effect.runPromiseWith(context)(Effect.gen(function* () {
  const neverExecuted = Effect.provide(Effect.void, PoolLive);
  void neverExecuted;
  const client = yield* PoolService;
  return client.read();
}));
