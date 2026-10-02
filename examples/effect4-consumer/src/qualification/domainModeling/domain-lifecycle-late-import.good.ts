// Import-order gap, not a repair.
export const conditional = (a: number, b: number, c: number) => a > 0 && b > 0 && c > 0;
export const flags = (state: { approved: boolean; rejected: boolean }) => state.approved && state.rejected;
export function failure() { throw new Error("Denied"); }
import { Effect } from "effect";
export const task = Effect.succeed(42);
