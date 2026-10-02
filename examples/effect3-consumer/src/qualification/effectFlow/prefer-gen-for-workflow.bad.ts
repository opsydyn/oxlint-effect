import { Effect, pipe } from "effect";
// linteffect/prefer-gen-for-workflow: >=3 selected sequencing operators.
export const workflow = <E>(source: Effect.Effect<number, E>, events: number[]) => source.pipe(Effect.flatMap(n => Effect.succeed(n + 1)), Effect.tap(n => Effect.sync(() => events.push(n))), Effect.andThen(n => Effect.succeed(n + 40)));
export const free = pipe(Effect.succeed(1), Effect.flatMap(n => Effect.succeed(n + 1)), Effect.flatMap(n => Effect.succeed(n + 1)), Effect.flatMap(n => Effect.succeed(n + 39)));
export const selected = Effect.succeed(1).pipe(Effect.zipRight(Effect.succeed(2)), Effect.zipRight(Effect.succeed(3)), Effect.zipRight(Effect.succeed(42)));
