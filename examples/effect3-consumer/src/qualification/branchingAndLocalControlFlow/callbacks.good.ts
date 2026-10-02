import { Effect, Match } from "effect";
export const mapped = [1].map(n => n + 41);
export const branched = [true, false].map(enabled => Match.value(enabled).pipe(Match.when(true, () => 42), Match.orElse(() => 0)));
export const task = Effect.map(Effect.succeed(1), n => n + 41);
// Named callback bodies are opaque, not endorsed bypasses.
const named = (n: number) => { return n + 41; };
export const opaque = [1].map(named);
export const generator = Effect.gen(function*() { const n = yield* Effect.succeed(1); return n + 41; });
// Callback objects are not direct function arguments.
export const object = { map: (n: number) => { return n + 41; } };
