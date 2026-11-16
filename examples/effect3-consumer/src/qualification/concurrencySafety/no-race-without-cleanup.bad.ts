import { Effect } from "effect";
// @lint-expect linteffect/no-race-without-cleanup: visible acquisition has no release owner.
export const two = <E>(winner: Effect.Effect<number, E>, openClient: () => Effect.Effect<number, E>) => Effect.race(winner, Effect.suspend(() => openClient()));
// @lint-expect linteffect/no-race-without-cleanup: collection branch acquires without release.
export const many = <E>(winner: Effect.Effect<number, E>, openClient: () => Effect.Effect<number, E>) => Effect.raceAll([winner, Effect.suspend(() => openClient())]);
