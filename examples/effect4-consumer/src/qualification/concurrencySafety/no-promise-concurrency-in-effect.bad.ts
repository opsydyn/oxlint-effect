import { Effect } from "effect";
// @lint-expect linteffect/no-promise-concurrency-in-effect
export const all = Effect.gen(function* () { yield* Effect.void; return Promise.all([Promise.resolve(1), Promise.resolve(2)]); });
// @lint-expect linteffect/no-promise-concurrency-in-effect
export const settled = Effect.gen(function* () { yield* Effect.void; return Promise.allSettled([Promise.resolve(1), Promise.reject("expected")]); });
// @lint-expect linteffect/no-promise-concurrency-in-effect
export const first = Effect.gen(function* () { yield* Effect.void; return Promise.race([Promise.resolve(42)]); });
// @lint-expect linteffect/no-promise-concurrency-in-effect
export const success = Effect.gen(function* () { yield* Effect.void; return Promise.any([Promise.reject("expected"), Promise.resolve(42)]); });
// @lint-expect linteffect/no-promise-concurrency-in-effect
export const mapped = Effect.map(Effect.succeed(42), value => Promise.all([Promise.resolve(value)]));
// @lint-expect linteffect/no-promise-concurrency-in-effect: major-specific recovery.
export const recovered = Effect.catch(Effect.fail("expected"), () => { void Promise.all([Promise.resolve(42)]); return Effect.succeed(42); });
// @lint-expect linteffect/no-promise-concurrency-in-effect
export const self = Effect.gen({ self: { value: 42 } }, function* () { return Promise.all([Promise.resolve(this.value)]); });
// @lint-expect linteffect/no-promise-concurrency-in-effect
export const named = Effect.fn("aggregate")(function* () { yield* Effect.void; return Promise.race([Promise.resolve(42)]); });
