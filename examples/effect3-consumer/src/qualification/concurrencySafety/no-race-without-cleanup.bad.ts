import { Effect } from "effect";
// linteffect/no-race-without-cleanup: release ownership is hidden behind task parameters.
export const two = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>) => Effect.race(winner, loser);
// linteffect/no-race-without-cleanup: collections also need visible resource cleanup.
export const many = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>) => Effect.raceAll([winner, loser]);
