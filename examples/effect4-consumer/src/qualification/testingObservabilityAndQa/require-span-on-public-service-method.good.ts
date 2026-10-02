import { Context, Effect } from "effect";
export const named = (): Effect.Effect<number> => Effect.withSpan(Effect.succeed(42), "Q28Operation");
export function branch(flag: boolean): Effect.Effect<number> {
  if (flag) return Effect.succeed(42).pipe(Effect.withSpan("Q28Operation"));
  return Effect.withSpan(Effect.succeed(42), "Q28Operation");
}
export const exit = <E>(task: Effect.Effect<number, E>): Effect.Effect<number, E> => Effect.withSpan(task, "Q28Exit");
// Inferred exports are outside the explicit-return policy, not trace proof.
export const inferred = () => Effect.succeed(42);
export class SpanService extends Context.Service<SpanService>()("Q28SpanGood", { make: Effect.succeed({ load: () => Effect.withSpan(Effect.succeed(42), "Q28Load") }) }) {}
// A disabled tracer does not execute useful tracing, though the syntax remains clean.
export const disabled = (): Effect.Effect<number> => Effect.succeed(42).pipe(Effect.withSpan("disabled"), Effect.withTracerEnabled(false));
