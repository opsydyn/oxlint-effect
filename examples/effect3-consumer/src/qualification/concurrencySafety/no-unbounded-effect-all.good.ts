import { Effect } from "effect";
const items = [1, 2, 3];
// Repair: use a finite concurrent budget, or keep the safe sequential default.
export const mapped = Effect.all(items.map(value => Effect.succeed(value * 2)), { concurrency: 2 });
export const discarded = Effect.all(items.map(Effect.succeed), { concurrency: 2, discard: true });
export const opaque = Effect.all(items.map(Effect.succeed), { concurrency: 2 });
export const failing = <E>(error: E) => Effect.all(items.map(() => Effect.fail(error)), { concurrency: 2 });
export const collect = <A, E>(work: (value: number) => Effect.Effect<A, E>) => Effect.all(items.map(work), { concurrency: 2 });
export const tuple = Effect.all([Effect.succeed(1), Effect.succeed(2)]);
const stored = items.map(Effect.succeed);
export const storedInput = Effect.all(stored);
export const quoted = Effect.all(items.map(Effect.succeed), { "concurrency": 1 });
export const explicitSequential = Effect.all(items.map(Effect.succeed));
export const collectSequential = <A, E>(work: (value: number) => Effect.Effect<A, E>) => Effect.all(items.map(work));
// Unknown values are not proof of a bound, but are not diagnosed without evidence.
const options = { concurrency: 2 };
export const namedOptions = Effect.all(stored, options);
export const mergedOptions = (overrides: { concurrency?: number }) => Effect.all(stored, { concurrency: "unbounded", ...overrides });
export const shadowedInfinity = (Infinity: number) => Effect.all(stored, { concurrency: Infinity });
