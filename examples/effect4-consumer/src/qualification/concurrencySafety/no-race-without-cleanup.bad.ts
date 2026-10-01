import { Effect, pipe } from "effect";
// linteffect/no-race-without-cleanup: release ownership is hidden behind task parameters.
export const two = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>) => Effect.race(winner, loser);
// linteffect/no-race-without-cleanup: collections also need visible resource cleanup.
export const many = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>) => Effect.raceAll([winner, loser]);
// linteffect/no-race-without-cleanup: first completion differs from first success.
export const first = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>) => Effect.raceFirst(winner, loser);
export const manyFirst = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>) => Effect.raceAllFirst([winner, loser]);
// linteffect/no-race-without-cleanup: curried construction is reported once.
export const curried = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>) => Effect.raceFirst(loser)(winner);
// linteffect/no-race-without-cleanup: functional and member pipes.
export const piped = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>) => winner.pipe(Effect.raceFirst(loser));
export const pipedMany = <E>(winner: Effect.Effect<number, E>, loser: Effect.Effect<number, E>) => pipe([winner, loser], Effect.raceAllFirst);
