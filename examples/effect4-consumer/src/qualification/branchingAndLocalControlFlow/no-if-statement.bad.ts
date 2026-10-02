import { Effect } from "effect";
// linteffect/no-if-statement: import-wide policy, even ordinary pure functions.
export function simple(enabled: boolean) { if (enabled) return 42; return 0; }
export function chained(n: number) { if (n > 1) return 42; else if (n === 1) return 1; return 0; }
export function nested(enabled: boolean, allowed: boolean) { if (enabled) { if (allowed) return 42; } return 0; }
export function unused() { const never = () => { if (true) return 1; return 0; }; return 42; }
export const task = Effect.succeed(42);
if (false) void task;
