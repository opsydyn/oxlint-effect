import { Effect } from "effect";

const items = [1, 2, 3];
const work = (value: number) => Effect.succeed(value);
const stored = items.map(work);

// EXPECT: linteffect/no-unbounded-effect-all
export const unbounded = Effect.all(items.map(work), { concurrency: "unbounded" });
// EXPECT: linteffect/no-unbounded-effect-all
export const infinite = Effect.all(stored, { concurrency: Infinity });
// EXPECT: linteffect/no-unbounded-concurrent-retry
export const retryStorm = Effect.forEach(items, value => Effect.retry(work(value), { times: 1 }), { concurrency: "unbounded" });

// Controls: omission is sequential; explicit finite budgets remain clean.
export const sequential = Effect.all(items.map(work));
export const bounded = Effect.all(stored, { concurrency: 2 });
export const serialRetry = Effect.forEach(items, value => Effect.retry(work(value), { times: 1 }));
// Scope limit: an opaque override may replace an earlier unbounded property.
export const unknownOverride = (options: { concurrency?: number }) => Effect.all(stored, { concurrency: "unbounded", ...options });
// A local binding named Infinity is not evidence of the global infinite value.
export const shadowedInfinity = (Infinity: number) => Effect.all(stored, { concurrency: Infinity });
