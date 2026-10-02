import { Effect, flow } from "effect";
import { increment, double, offset, identity } from "./pure-steps";
export const transform = flow(increment, double, offset);
export const value = transform(1);
const first = increment(1);
const second = double(first);
export const explicit = offset(second);
export const task = Effect.map(Effect.succeed(1), transform);
// The impurity blacklist is name-only: even an ordinary local fetch breaks depth.
export function nameGap() { const fetch = (n: number) => n + 41; return identity(identity(fetch(1))); }
// Clean counterexample preserves observable work but does not establish a pure flow.
export function opaqueMutation(events: string[]) { const touch = (n: number) => { events.push("touch"); return n + 41; }; return flow(touch, identity, identity)(1); }
