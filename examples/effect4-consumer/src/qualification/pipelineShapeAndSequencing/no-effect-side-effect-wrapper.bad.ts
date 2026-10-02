import { Effect } from "effect";
// linteffect/no-effect-side-effect-wrapper: as and own-major sequence discard.
export const logged = Effect.as(Effect.logInfo("Q43 log"), 42);
export const sequence = Effect.andThen(Effect.logInfo("Q43 sequence"), Effect.succeed(42));
export function consoleTask() { return Effect.as(Effect.sync(() => console.info("Q43 console")), 42); }
// These local controls are ordinary name heuristics, not React/Atom API proof.
export function state(events: string[]) { const setState = () => { events.push("state"); }; return Effect.as(Effect.sync(() => setState()), 42); }
export function invalidation(events: string[]) { const invalidate = () => { events.push("invalidate"); }; return Effect.as(Effect.sync(() => invalidate()), 42); }
export function atom(events: string[]) { const Atom = { set: () => { events.push("atom"); } }; return Effect.as(Effect.sync(() => Atom.set()), 42); }
// Broad search reports even an unused callback.
export const unused = Effect.as(Effect.sync(() => { const never = () => console.info("never"); return 42; }), 42);
