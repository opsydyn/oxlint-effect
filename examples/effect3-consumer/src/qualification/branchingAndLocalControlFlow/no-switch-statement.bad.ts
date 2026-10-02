import { Effect } from "effect";
// linteffect/no-switch-statement: ordinary pure decision trees also warn.
export function state(mode: "ready" | "waiting") { switch (mode) { case "ready": return 42; case "waiting": return 0; } }
export function fallback(mode: string) { switch (mode) { case "ready": case "complete": return 42; default: return 0; } }
export function unused() { const never = () => { switch ("ready") { default: return 0; } }; return 42; }
export const task = Effect.succeed(42);
