import { Effect, pipe as p } from "effect";
export const task = Effect.gen(function*() { const n = yield* Effect.succeed(1); return n + 41; });
export const flat = Effect.succeed(1).pipe(Effect.map(n => n + 41));
export const aliased = p(p(p(1, n => n + 39), n => n + 1), n => n + 1);
// Computed pipe receivers escape the detector.
export const computed = Effect.succeed(1)["pipe"](Effect.flatMap(n => Effect.succeed(n)["pipe"](Effect.map(m => m + 41))));
