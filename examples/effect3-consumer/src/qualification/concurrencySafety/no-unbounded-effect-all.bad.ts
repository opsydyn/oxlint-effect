import { Effect } from "effect";
export const items = [1, 2, 3];
// EXPECT: linteffect/no-unbounded-effect-all: explicit whole-collection fan-out.
export const mapped = Effect.all(items.map(value => Effect.succeed(value * 2)), { concurrency: "unbounded" });
// EXPECT: linteffect/no-unbounded-effect-all: discarding values does not bound work.
export const discarded = Effect.all(items.map(Effect.succeed), { concurrency: Infinity, discard: true });
const stored = items.map(Effect.succeed);
// EXPECT: linteffect/no-unbounded-effect-all: stored inputs also need a finite budget.
export const opaque = Effect.all(stored, { concurrency: "unbounded" });
// EXPECT: linteffect/no-unbounded-effect-all: preserve failure identity in the repair.
export const failing = <E>(error: E) => Effect.all(items.map(() => Effect.fail(error)), { concurrency: "unbounded" });
// EXPECT: linteffect/no-unbounded-effect-all: reusable collection for runtime budget checks.
export const collect = <A, E>(work: (value: number) => Effect.Effect<A, E>) => Effect.all(items.map(work), { concurrency: "unbounded" });
