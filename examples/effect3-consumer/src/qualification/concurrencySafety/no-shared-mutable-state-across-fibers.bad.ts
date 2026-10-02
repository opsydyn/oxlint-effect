import { Effect } from "effect";
let completed = 0;
let values: number[] = [];
export const reset = () => { completed = 0; values = []; };
export const read = () => completed;
// @lint-expect linteffect/no-shared-mutable-state-across-fibers: split read/write loses updates.
export const lostUpdate = (beforeWrite: () => Promise<void>) => Effect.forEach([1, 2], () => Effect.gen(function* () { const snapshot = completed; yield* Effect.promise(beforeWrite); completed = snapshot + 1; }), { concurrency: 2 });
// @lint-expect linteffect/no-shared-mutable-state-across-fibers
export const fork = Effect.fork(Effect.sync(() => { completed++; return completed; }));
// @lint-expect linteffect/no-shared-mutable-state-across-fibers
export const all = Effect.all([1, 2].map(() => Effect.sync(() => ++completed)), { concurrency: 2 });
// @lint-expect linteffect/no-shared-mutable-state-across-fibers
export const forEach = Effect.forEach([1, 2], value => Effect.sync(() => { values.push(value); return value; }), { concurrency: 2 });
// Still diagnosed by collection syntax, even though omitted concurrency is sequential.
// @lint-expect linteffect/no-shared-mutable-state-across-fibers
export const sequential = Effect.forEach([1, 2], () => Effect.sync(() => completed++));
