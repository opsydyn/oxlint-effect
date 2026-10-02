import { Effect } from "effect";
let completed = 0;
const values: number[] = [];
const cache = new Map<number, number>();
const members = new Set<number>();
export const reset = () => { completed = 0; values.length = 0; cache.clear(); members.clear(); };
export const read = () => completed;
// @lint-expect linteffect/no-global-mutable-concurrency-state: split module read/write.
export const lostUpdate = (beforeWrite: () => Promise<void>) => Effect.forEach([1, 2], () => Effect.gen(function* () { const snapshot = completed; yield* Effect.promise(beforeWrite); completed = snapshot + 1; }), { concurrency: 2 });
// @lint-expect linteffect/no-global-mutable-concurrency-state
export const fork = Effect.fork(Effect.sync(() => ++completed));
// @lint-expect linteffect/no-global-mutable-concurrency-state
export const all = Effect.all([1, 2].map(() => Effect.sync(() => ++completed)), { concurrency: 2 });
// @lint-expect linteffect/no-global-mutable-concurrency-state
export const append = Effect.forEach([1, 2], value => Effect.sync(() => { values.push(value); return value; }));
// @lint-expect linteffect/no-global-mutable-concurrency-state
export const map = Effect.forEach([1, 2], value => Effect.sync(() => { cache.set(value, value); return value; }));
// @lint-expect linteffect/no-global-mutable-concurrency-state
export const set = Effect.forEach([1, 2], value => Effect.sync(() => { members.add(value); return value; }));
// @lint-expect linteffect/no-global-mutable-concurrency-state: retained legacy name collection.
// The old detector also collects function-local declarations, despite its rule name.
export const localLegacy = () => { let local = 0; return Effect.forEach([1, 2], () => Effect.sync(() => ++local)); };
