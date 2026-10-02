import { Effect } from "effect";
// Test ports deliberately model Sync-suffixed calls; this is a syntax heuristic.
const fs = { readFileSync: () => 42 };
const crypto = { randomBytesSync: () => 42 };
const readFileSync = () => 42;
// @lint-expect linteffect/no-blocking-call-in-effect: wrapping does not offload.
export const sync = Effect.sync(() => fs.readFileSync());
// @lint-expect linteffect/no-blocking-call-in-effect
export const generator = Effect.gen(function* () { const value = crypto.randomBytesSync(); yield* Effect.void; return value; });
// @lint-expect linteffect/no-blocking-call-in-effect
export const suffix = Effect.sync(() => readFileSync());
const owner = { value: 42 };
// @lint-expect linteffect/no-blocking-call-in-effect
export const self = Effect.gen({ self: owner }, function* () { return fs.readFileSync() + this.value - 42; });
// @lint-expect linteffect/no-blocking-call-in-effect
export const fn = Effect.fn(function* () { yield* Effect.void; return fs.readFileSync(); });
// @lint-expect linteffect/no-blocking-call-in-effect
export const named = Effect.fn("blocking")(function* () { yield* Effect.void; return fs.readFileSync(); });
