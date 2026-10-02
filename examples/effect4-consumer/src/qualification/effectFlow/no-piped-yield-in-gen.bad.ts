import { Effect } from "effect";
// linteffect/no-piped-yield-in-gen: repeated inline decoration; reports second yield.
export const two = Effect.gen(function* () { const a = yield* Effect.succeed(1).pipe(Effect.map(n => n + 1)); const b = yield* Effect.succeed(40).pipe(Effect.map(n => n)); return a + b; });
export const three = Effect.gen(function* () { const a = yield* Effect.succeed(1).pipe(Effect.map(n => n)); const b = yield* Effect.succeed(1).pipe(Effect.map(n => n)); const c = yield* Effect.succeed(40).pipe(Effect.map(n => n)); return a + b + c; });
// Broad traversal counts a nested generator for both owners.
export const nested = Effect.gen(function* () { return yield* Effect.gen(function* () { const a = yield* Effect.succeed(1).pipe(Effect.map(n => n)); const b = yield* Effect.succeed(41).pipe(Effect.map(n => n)); return a + b; }); });
// Unused ordinary generator bodies can also trigger the outer owner.
export const unused = Effect.gen(function* () { function* ignored() { yield* Effect.succeed(1).pipe(Effect.map(n => n)); yield* Effect.succeed(41).pipe(Effect.map(n => n)); } return 42; });
