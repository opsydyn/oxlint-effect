import { Effect } from "effect";
interface Flags { approved: boolean; rejected: boolean; pending: boolean }
// linteffect/no-implicit-state-machine-object: distinct matched flags on same name.
export const two = (state: Flags) => state.approved && state.rejected;
// Outer and inner expressions both warn.
export const three = (state: Flags) => state.approved && state.rejected && state.pending;
export const either = (state: Flags) => state.approved || state.pending;
export const task = Effect.succeed(42);
