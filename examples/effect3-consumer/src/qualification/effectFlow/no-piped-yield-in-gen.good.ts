import { Effect } from "effect";
// Working repair names already-decorated steps before the generator.
const first = Effect.succeed(1).pipe(Effect.map(n => n + 1));
const second = Effect.succeed(40).pipe(Effect.map(n => n));
export const named = Effect.gen(function* () { const a = yield* first; const b = yield* second; return a + b; });
// One piped yield is allowed by threshold.
export const one = Effect.gen(function* () { return yield* Effect.succeed(42).pipe(Effect.map(n => n)); });
