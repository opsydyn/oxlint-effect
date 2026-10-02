import { Effect } from "effect";
// Genuinely asynchronous callback scheduling, not a Promise around a Sync call.
export const asynchronous = Effect.async<number>(resume => { queueMicrotask(() => resume(Effect.succeed(42))); });
export const adapter = <E>(operation: (signal: AbortSignal) => Promise<number>, failure: E) => Effect.tryPromise({ try: operation, catch: () => failure });
// Clean limits: unrelated/computed spellings are not inferred as blocking.
const port = { readFileSync: () => 42, info: () => 42 };
export const unrelated = Effect.sync(() => port.readFileSync());
export const computed = Effect.sync(() => port["readFileSync"]());
