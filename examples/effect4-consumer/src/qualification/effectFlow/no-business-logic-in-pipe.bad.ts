import { Effect } from "effect";
import { ReaderService } from "./business-service";
// linteffect/no-business-logic-in-pipe: control flow in inline flatMap callbacks.
export const branch = <E>(source: Effect.Effect<boolean, E>) => source.pipe(Effect.flatMap(enabled => { if (enabled) return Effect.succeed(42); return Effect.succeed(0); }));
export const switchCase = Effect.succeed(true).pipe(Effect.flatMap(enabled => { switch (enabled) { case true: return Effect.succeed(42); default: return Effect.succeed(0); } }));
export const forLoop = Effect.succeed(42).pipe(Effect.flatMap(n => { for (let i = 0; i < 1; i++) n += 0; return Effect.succeed(n); }));
export const forIn = Effect.succeed<Record<string, number>>({ value: 42 }).pipe(Effect.flatMap(values => { let total = 0; for (const key in values) total += values[key] ?? 0; return Effect.succeed(total); }));
export const forOf = Effect.succeed([42]).pipe(Effect.flatMap(values => { let total = 0; for (const value of values) total += value; return Effect.succeed(total); }));
export const whileLoop = Effect.succeed(42).pipe(Effect.flatMap(n => { let i = 0; while (i < 1) i++; return Effect.succeed(n); }));
export const doLoop = Effect.succeed(42).pipe(Effect.flatMap(n => { let i = 0; do { i++; } while (i < 1); return Effect.succeed(n); }));
export const service = Effect.succeed(1).pipe(Effect.flatMap(() => Effect.gen(function* () { const reader = yield* ReaderService; return yield* reader.load(); })));
export const multiple = Effect.succeed(1).pipe(Effect.flatMap(n => Effect.gen(function* () { const first = yield* Effect.succeed(n); return yield* Effect.succeed(first + 41); })));
// Broad body walk can warn on unused ordinary control flow and two constructor calls.
export const unused = Effect.succeed(42).pipe(Effect.flatMap(n => { const ignored = () => { if (n > 0) return 1; return 0; }; return Effect.succeed(n); }));
export const mapping = Effect.succeed(1).pipe(Effect.flatMap(n => Effect.map(Effect.succeed(n), n => n + 41)));
// First qualifying callback only, not one diagnostic for each operator.
export const twoCallbacks = Effect.succeed(true).pipe(Effect.flatMap(value => { if (value) return Effect.succeed(true); return Effect.succeed(false); }), Effect.flatMap(value => { if (value) return Effect.succeed(42); return Effect.succeed(0); }));
export const expression = Effect.succeed(true).pipe(Effect.flatMap(function(value) { if (value) return Effect.succeed(42); return Effect.succeed(0); }));
export const eager = Effect.succeed(true).pipe(Effect.flatMapEager(value => { if (value) return Effect.succeed(42); return Effect.succeed(0); }));
