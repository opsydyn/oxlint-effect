import { Effect } from "effect";
// linteffect/no-gen-for-mapping: exactly one yielded binding plus transformed return.
export const simple = <E>(source: Effect.Effect<number, E>) => Effect.gen(function* () { const n = yield* source; return n + 41; });
export const object = <E>(source: Effect.Effect<number, E>) => Effect.gen(function* () { const n = yield* source; return { count: n + 41 }; });
// Syntax does not establish purity of a called transform.
export const called = (transform: (n: number) => number) => Effect.gen(function* () { const n = yield* Effect.succeed(1); return transform(n); });
export const constant = Effect.gen(function* () { const n = yield* Effect.succeed(1); return 42; });
