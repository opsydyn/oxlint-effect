import { Effect } from "effect";
export const all = Effect.all([Effect.succeed(1), Effect.succeed(2)], { concurrency: 2 });
// Typed failures become data. Defects/interruption still propagate.
export const settled = Effect.all([Effect.result(Effect.succeed(1)), Effect.result(Effect.fail("expected"))], { concurrency: 2 });
export const first = <E>(left: Effect.Effect<number, E>, right: Effect.Effect<number, E>) => Effect.raceFirst(left, right);
export const success = <E>(left: Effect.Effect<number, E>, right: Effect.Effect<number, E>) => Effect.race(left, right);
// A signal parameter only helps if the actual platform operation observes it.
export const adapter = <E>(operation: (signal: AbortSignal) => Promise<number>, failure: E) => Effect.tryPromise({ try: operation, catch: () => failure });
// Clean limits: a boundary adapter may aggregate promises; aliases are not inferred.
export const boundary = Effect.tryPromise(() => Promise.all([Promise.resolve(42)]));
const aggregate = Promise.all;
export const alias = Effect.sync(() => aggregate.call(Promise, [Promise.resolve(42)]));
export const nested = Effect.sync(() => () => Promise.all([Promise.resolve(42)]));
