import { Effect } from "effect";
export const simple = <E>(source: Effect.Effect<number, E>) => Effect.map(source, n => n + 41);
export const object = <E>(source: Effect.Effect<number, E>) => Effect.map(source, n => ({ count: n + 41 }));
export const identity = Effect.gen(function* () { const n = yield* Effect.succeed(42); return n; });
export const extra = Effect.gen(function* () { const n = yield* Effect.succeed(1); const result = n + 41; return result; });
const body = function* () { const n = yield* Effect.succeed(1); return n + 41; };
export const opaque = Effect.gen(body);
