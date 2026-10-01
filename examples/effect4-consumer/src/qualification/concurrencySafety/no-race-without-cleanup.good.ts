import { Effect, pipe } from "effect";
// Repair: interrupted losers release their owned resources explicitly.
export const two = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>, cleanup: Effect.Effect<void>) => Effect.race(winner, loser.pipe(Effect.ensuring(cleanup)));
export const many = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>, cleanup: Effect.Effect<void>) => Effect.raceAll([winner, Effect.ensuring(loser, cleanup)]);
export const first = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>, cleanup: Effect.Effect<void>) => Effect.raceFirst(winner, loser.pipe(Effect.ensuring(cleanup)));
export const manyFirst = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>, cleanup: Effect.Effect<void>) => Effect.raceAllFirst([winner, loser.pipe(Effect.ensuring(cleanup))]);
export const curried = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>, cleanup: Effect.Effect<void>) => Effect.raceFirst(loser.pipe(Effect.ensuring(cleanup)))(winner);
export const piped = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>, cleanup: Effect.Effect<void>) => winner.pipe(Effect.raceFirst(loser.pipe(Effect.ensuring(cleanup))));
export const pipedMany = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>, cleanup: Effect.Effect<void>) => pipe([winner, loser.pipe(Effect.ensuring(cleanup))], Effect.raceAllFirst);
// Clean: surrounding scope/finalizer wrappers are visible local ownership markers.
export const boundary = Effect.scoped(Effect.race(Effect.succeed(42), Effect.never));
export const generatorBoundary = Effect.scoped(Effect.gen(function* () {
  return yield* Effect.raceFirst(Effect.succeed(42), Effect.never);
}));
const owner = { name: "race" };
export const selfBoundary = Effect.scoped(Effect.gen({ self: owner }, function* () {
  return yield* Effect.raceFirst(Effect.succeed(42), Effect.never);
}));
export const tracedBoundary = Effect.scoped(Effect.fn("Q17.race")(function* () {
  return yield* Effect.raceFirst(Effect.succeed(42), Effect.never);
})());
export let useReleases = 0;
export const useBoundary = Effect.acquireUseRelease(
  Effect.succeed({ value: 42 }),
  resource => Effect.raceFirst(Effect.succeed(resource.value), Effect.never),
  () => Effect.sync(() => { useReleases++; }),
);
export const outerPipe = Effect.raceFirst(Effect.succeed(42), Effect.never).pipe(Effect.ensuring(Effect.void));
export const winners: number[] = [];
export const observedWinner = Effect.raceFirst(Effect.succeed(42), Effect.never, {
  onWinner: ({ index }) => { winners.push(index); },
}).pipe(Effect.ensuring(Effect.void));
// Clean: explicit acquire/release on the resource-owning loser.
export const resource = Effect.race(Effect.succeed(42), Effect.scoped(Effect.gen(function* () {
  yield* Effect.acquireRelease(Effect.succeed({ value: 42 }), () => Effect.void);
  return yield* Effect.never;
})));
