import { Effect } from "effect";
import { PoolLive, PoolService } from "./pool-layer";

export const owned = () => Effect.runPromise(Effect.provide(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }), PoolLive));
const program = Effect.provide(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }), PoolLive);
export const named = () => Effect.runPromise(program);
export const piped = () => Effect.runPromise(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }).pipe(Effect.provide(PoolLive)));
export const two = () => Effect.runPromise(Effect.provide(Effect.gen(function* () { const client = yield* PoolService; return [client.read(), client.read()]; }), PoolLive));
export const plain = () => Effect.runPromise(Effect.succeed(42));
