import { Effect } from "effect";
const items = [1, 2, 3];
// EXPECT: linteffect/no-unbounded-concurrent-retry: retries amplify unbounded fan-out.
export const mapped = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.all(items.map(value => Effect.retry(work(value), { times: 1 })), { concurrency: "unbounded" });
// EXPECT: linteffect/no-unbounded-concurrent-retry: forEach is also covered.
export const forEach = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.forEach(items, value => Effect.retry(work(value), { times: 1 }), { concurrency: "unbounded" });
// EXPECT: linteffect/no-unbounded-concurrent-retry: piped retry with an infinite budget.
export const piped = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.all(items.map(value => work(value).pipe(Effect.retry({ times: 1 }))), { concurrency: Infinity });
// EXPECT: linteffect/no-unbounded-concurrent-retry: Infinity does not impose a bound.
export const opaque = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.forEach(items, value => Effect.retry(work(value), { times: 1 }), { concurrency: Infinity });
