import { Effect } from "effect";
// Repair: interrupted losers release their owned resources explicitly.
export const two = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>, cleanup: Effect.Effect<void>) => Effect.race(winner, loser.pipe(Effect.ensuring(cleanup)));
export const many = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>, cleanup: Effect.Effect<void>) => Effect.raceAll([winner, Effect.ensuring(loser, cleanup)]);
// Clean legacy marker: scoped argument. This is not proof every branch releases.
export const boundary = Effect.race(Effect.scoped(Effect.succeed(42)), Effect.never);
// Known legacy limit: raceFirst exists but is outside the original detector.
export const firstNotTracked = Effect.raceFirst(Effect.succeed(42), Effect.never);
// Clean: explicit acquire/release on the resource-owning loser.
export const resource = Effect.race(Effect.succeed(42), Effect.scoped(Effect.gen(function* () {
  yield* Effect.acquireRelease(Effect.succeed({ value: 42 }), () => Effect.void);
  return yield* Effect.never;
})));
