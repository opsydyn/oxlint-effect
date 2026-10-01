import { Effect, flow } from "effect";
const shape = flow((n: number) => n + 1);
const workflow = Effect.gen(function* () { return shape(yield* Effect.succeed(1)); });
export const program = workflow.pipe(Effect.catchEager(() => Effect.succeed(2)));
// Two pillars are below the three-pillar threshold.
export function twoPillars() { return Effect.gen(function* () { return yield* Effect.succeed(1); }).pipe(Effect.withSpan("two")); }
// Legitimate pure composition remains clean.
export const transform = flow((n: number) => n + 1, n => n * 2);
