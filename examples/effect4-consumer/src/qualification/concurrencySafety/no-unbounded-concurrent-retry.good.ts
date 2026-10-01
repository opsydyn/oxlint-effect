import { Effect } from "effect";
const items = [1, 2, 3];
// Repair: separate the collection budget from each job's retry budget.
export const mapped = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.all(items.map(value => Effect.retry(work(value), { times: 1 })), { concurrency: 2 });

export const forEach = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.forEach(items, value => Effect.retry(work(value), { times: 1 }), { concurrency: 2 });

export const piped = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.all(items.map(value => work(value).pipe(Effect.retry({ times: 1 }))), { concurrency: 2 });

const options = { concurrency: 2 };
export const opaque = <E>(work: (value: number) => Effect.Effect<number, E>) => Effect.forEach(items, value => Effect.retry(work(value), { times: 1 }), { concurrency: options.concurrency });
// Clean limits: option presence is not validation of concurrency or retry bounds.
export const explicitUnbounded = Effect.forEach(items, value => Effect.retry(Effect.succeed(value), { times: 1 }), { concurrency: "unbounded" });
export const noRetry = Effect.forEach(items, value => Effect.succeed(value));
const stored = items.map(value => Effect.retry(Effect.succeed(value), { times: 1 }));
export const storedInput = Effect.all(stored);
