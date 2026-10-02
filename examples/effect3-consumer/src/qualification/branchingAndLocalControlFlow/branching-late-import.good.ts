export function before(enabled: boolean) { if (enabled) return 42; return 0; }
export function beforeSwitch(mode: "ready" | "waiting") { switch (mode) { case "ready": return 42; case "waiting": return 0; } }
export const beforeTernary = (enabled: boolean) => enabled ? 42 : 0;
// Same file, but import appears after the visited statements.
import { Effect } from "effect";
export const task = Effect.succeed(42);
