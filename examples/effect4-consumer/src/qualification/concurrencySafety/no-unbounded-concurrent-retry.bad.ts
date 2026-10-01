import { Effect } from "effect";
const items = [1, 2, 3];
// linteffect/no-unbounded-concurrent-retry: retry scheduling policy is not explicit.
export const mapped = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.all(items.map(value => Effect.retry(work(value), { times: 1 })));
// linteffect/no-unbounded-concurrent-retry: forEach is also covered.
export const forEach = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.forEach(items, value => Effect.retry(work(value), { times: 1 }));
// linteffect/no-unbounded-concurrent-retry: piped retry with a data-last policy.
export const piped = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.all(items.map(value => work(value).pipe(Effect.retry({ times: 1 }))));
// linteffect/no-unbounded-concurrent-retry: named options are not resolved.
const options = { concurrency: 2 };
export const opaque = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.forEach(items, value => Effect.retry(work(value), { times: 1 }), options);
