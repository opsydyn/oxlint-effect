import { Effect } from "effect";
// linteffect/no-try-catch: no import gate, including ordinary exception adapters.
export function attempt(fn: () => number) { try { return fn(); } catch (error) { return { _tag: "Failure" as const, error }; } }
export function nested() { try { try { return 42; } catch { return 1; } } catch { return 0; } }
export function cleanup(fn: () => number, events: string[]) { try { return fn(); } finally { events.push("cleanup"); } }
export function unused() { const never = () => { try { return 0; } catch { return 1; } }; return 42; }
export const task = Effect.succeed(42);
