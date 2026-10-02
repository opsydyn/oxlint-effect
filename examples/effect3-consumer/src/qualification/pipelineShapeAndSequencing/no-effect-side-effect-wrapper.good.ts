import { Effect } from "effect";
export const logged = Effect.gen(function*() { yield* Effect.logInfo("Q43 log"); return 42; });
export const sequence = Effect.gen(function*() { yield* Effect.logInfo("Q43 sequence"); return 42; });
export function consoleTask() { return Effect.gen(function*() { yield* Effect.sync(() => console.info("Q43 console")); return 42; }); }
export function state(events: string[]) { return Effect.gen(function*() { yield* Effect.sync(() => { events.push("state"); }); return 42; }); }
export function invalidation(events: string[]) { return Effect.gen(function*() { yield* Effect.sync(() => { events.push("invalidate"); }); return 42; }); }
export function atom(events: string[]) { return Effect.gen(function*() { yield* Effect.sync(() => { events.push("atom"); }); return 42; }); }
// Named side-effect steps are opaque to the wrapper search, not a semantic repair.
const hidden = Effect.logInfo("hidden");
export const opaque = Effect.as(hidden, 42);
