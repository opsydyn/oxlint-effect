import { Effect } from "effect";
const first = Effect.succeed(1);
const fallback = () => Effect.succeed(42);
// linteffect/no-effect-orElse-ladder: all four legacy sequencing tokens.
export const flat = Effect.orElse(Effect.flatMap(first, n => Effect.succeed(n + 41)), fallback);
export const zip = Effect.orElse(Effect.zipRight(first, Effect.succeed(42)), fallback);
export const as = Effect.orElse(Effect.as(first, 42), fallback);
export const tap = Effect.orElse(Effect.tap(Effect.succeed(42), () => Effect.void), fallback);
// Broad search includes unused callback sequencing.
export const unused = Effect.orElse(Effect.map(first, n => { const never = () => Effect.flatMap(first, () => first); return n + 41; }), fallback);
export function original(events: string[], failure?: object) {
  return Effect.orElse(Effect.flatMap(
    Effect.sync(() => { events.push("first"); return 1; }),
    n => failure ? Effect.fail(failure) : Effect.sync(() => { events.push("second"); return n + 41; }),
  ), () => Effect.sync(() => { events.push("fallback"); return 42; }));
}
