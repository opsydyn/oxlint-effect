import { Effect } from "effect";
// @lint-expect linteffect/require-span-on-public-service-method (five exported function shapes).
export function named(): Effect.Effect<number> { return Effect.succeed(42); }
export default function direct(): Effect.Effect<number> { return Effect.succeed(42); }
export const arrow = (): Effect.Effect<number> => Effect.succeed(42);
export const typed: () => Effect.Effect<number> = () => Effect.succeed(42);
export const expression = function(): Effect.Effect<number> { return Effect.succeed(42); };
// @lint-expect linteffect/require-span-on-public-service-method: one unspanned branch is enough.
export function partial(flag: boolean): Effect.Effect<number> { if (flag) return Effect.withSpan(Effect.succeed(42), "partial"); return Effect.succeed(42); }
// @lint-expect linteffect/require-span-on-public-service-method: stored span is not resolved.
const stored = Effect.withSpan(Effect.succeed(42), "stored");
export function opaqueStored(): Effect.Effect<number> { return stored; }
// @lint-expect linteffect/require-span-on-public-service-method (service methods).
export class SpanService extends Effect.Service<SpanService>()("Q28Span", { effect: Effect.succeed({ load: () => Effect.succeed(42) }) }) {}
