import { Effect, pipe } from "effect";
import { applyResponse, original, rejected, success, wrapGraphqlCall, type Envelope } from "./envelope";
// no-wrapgraphql-catchall: broad fallback removes the original error channel.
export const wrapped = Effect.fail(original).pipe(wrapGraphqlCall(), Effect.catch(() => Effect.succeed(42)));
export const response = (value: Envelope) => Effect.succeed(value).pipe(Effect.flatMap(applyResponse), Effect.catch(() => Effect.succeed(42)));
export const free = pipe(Effect.fail(original), wrapGraphqlCall(), Effect.catch(() => Effect.succeed(42)));
// Historical syntax policy does not actually order/check envelope ownership.
export const before = Effect.fail(original).pipe(Effect.catch(() => Effect.succeed(42)), wrapGraphqlCall());
export const unused = Effect.fail(original).pipe(Effect.catch(() => { const neverCalled = () => wrapGraphqlCall(); return Effect.succeed(42); }));
export const eager = Effect.fail(original).pipe(wrapGraphqlCall(), Effect.catchEager(() => Effect.succeed(42)));
export const eagerResponse = Effect.succeed(rejected).pipe(Effect.flatMapEager(applyResponse), Effect.catchEager(() => Effect.succeed(42)));
