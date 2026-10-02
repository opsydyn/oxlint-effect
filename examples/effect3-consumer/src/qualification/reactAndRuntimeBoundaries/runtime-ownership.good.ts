import { Effect } from "effect";
// Domain returns Effect; the explicit application boundary owns execution.
export const task = <E>(program: Effect.Effect<number, E>) => program;
