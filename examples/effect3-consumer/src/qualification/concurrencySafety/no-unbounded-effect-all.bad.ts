import { Effect } from "effect";
export const items = [1, 2, 3];
// linteffect/no-unbounded-effect-all: explicit collection scheduling policy is absent.
export const mapped = Effect.all(items.map(value => Effect.succeed(value * 2)));
// linteffect/no-unbounded-effect-all: unrelated options do not state concurrency.
export const discarded = Effect.all(items.map(Effect.succeed), { discard: true });
// linteffect/no-unbounded-effect-all: a named options object is not inferred.
const options = { concurrency: 2 };
export const opaque = Effect.all(items.map(Effect.succeed), options);
// linteffect/no-unbounded-effect-all: preserve failure identity in the repair.
export const failing = <E>(error: E) => Effect.all(items.map(() => Effect.fail(error)));
// linteffect/no-unbounded-effect-all: reusable collection for deterministic budget checks.
export const collect = <A, E>(work: (value: number) => Effect.Effect<A, E>) => Effect.all(items.map(work));
