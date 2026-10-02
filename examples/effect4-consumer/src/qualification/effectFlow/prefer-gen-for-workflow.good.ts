import { Effect } from "effect";
export const workflow = <E>(source: Effect.Effect<number, E>, events: number[]) => Effect.gen(function* () {
 const n = yield* source;
 const incremented = yield* Effect.succeed(n + 1);
 yield* Effect.sync(() => events.push(incremented));
 return yield* Effect.succeed(incremented + 40);
});
export const short = Effect.succeed(1).pipe(Effect.flatMap(n => Effect.succeed(n + 1)), Effect.andThen(() => Effect.succeed(42)));
// Aliased operators remain opaque.
const flatMap = Effect.flatMap;
export const alias = Effect.succeed(1).pipe(flatMap(n => Effect.succeed(n + 1)), flatMap(n => Effect.succeed(n + 1)), flatMap(n => Effect.succeed(n + 39)));
