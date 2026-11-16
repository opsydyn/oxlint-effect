import { Effect, pipe } from "effect";
// @lint-expect linteffect/no-race-without-cleanup: visible acquisition has no release owner.
export const two = <E>(winner: Effect.Effect<number, E>, openClient: () => Effect.Effect<number, E>) => Effect.race(winner, Effect.suspend(() => openClient()));
// @lint-expect linteffect/no-race-without-cleanup: collection branch acquires without release.
export const many = <E>(winner: Effect.Effect<number, E>, openClient: () => Effect.Effect<number, E>) => Effect.raceAll([winner, Effect.suspend(() => openClient())]);
// linteffect/no-race-without-cleanup: first completion differs from first success.
export const first = <E>(winner: Effect.Effect<number, E>, openClient: () => Effect.Effect<number, E>) => Effect.raceFirst(winner, Effect.suspend(() => openClient()));
export const manyFirst = <E>(winner: Effect.Effect<number, E>, openClient: () => Effect.Effect<number, E>) => Effect.raceAllFirst([winner, Effect.suspend(() => openClient())]);
// linteffect/no-race-without-cleanup: curried construction is reported once.
export const curried = <E>(winner: Effect.Effect<number, E>, openClient: () => Effect.Effect<number, E>) => Effect.raceFirst(Effect.suspend(() => openClient()))(winner);
// linteffect/no-race-without-cleanup: functional and member pipes.
export const piped = <E>(winner: Effect.Effect<number, E>, openClient: () => Effect.Effect<number, E>) => winner.pipe(Effect.raceFirst(Effect.suspend(() => openClient())));
export const pipedMany = <E>(winner: Effect.Effect<number, E>, openClient: () => Effect.Effect<number, E>) => pipe([winner, Effect.suspend(() => openClient())], Effect.raceAllFirst);
