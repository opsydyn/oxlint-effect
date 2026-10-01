import { Effect } from "effect";
const items = [1, 2, 3];
// Repair: spell out the intended scheduling budget.
export const mapped = Effect.all(items.map(value => Effect.succeed(value * 2)), { concurrency: 2 });
export const discarded = Effect.all(items.map(Effect.succeed), { concurrency: 2, discard: true });
export const opaque = Effect.all(items.map(Effect.succeed), { concurrency: 2 });
export const failing = <E>(error: E) => Effect.all(items.map(() => Effect.fail(error)), { concurrency: 2 });
export const collect = <A, E>(work: (value: number) => Effect.Effect<A, E>) => Effect.all(items.map(work), { concurrency: 2 });
// Clean scope controls: only immediate .map inputs and option presence are inspected.
export const tuple = Effect.all([Effect.succeed(1), Effect.succeed(2)]);
const stored = items.map(Effect.succeed);
export const storedInput = Effect.all(stored);
export const quoted = Effect.all(items.map(Effect.succeed), { "concurrency": 1 });
// Known heuristic limit: option presence is not proof that its value is bounded.
export const explicitUnbounded = Effect.all(items.map(Effect.succeed), { concurrency: "unbounded" });
