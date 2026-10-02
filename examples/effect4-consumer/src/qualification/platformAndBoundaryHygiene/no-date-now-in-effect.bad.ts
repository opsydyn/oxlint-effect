import { Effect } from "effect";
// @lint-expect linteffect/no-date-now-in-effect (eight common Date.now call sites).
export const sync = Effect.sync(() => Date.now());
export const gen = Effect.gen(function* () { return Date.now(); });
export const attempt = Effect.try(() => Date.now());
export const asyncAttempt = Effect.tryPromise(() => Promise.resolve(Date.now()));
export const fn = Effect.fn(function* () { return Date.now(); });
export const named = Effect.fn("Q26-clock")(function* () { return Date.now(); });
export const nested = Effect.gen(function* () { return yield* Effect.sync(() => Date.now()); });
// Retained broad traversal: this unused callback is never run, but still warns.
export const unused = Effect.gen(function* () { const neverCalled = () => Date.now(); void neverCalled; return 42; });
// V3's existing gap stays opaque; current policy recognises this valid function form.
export const untraced = Effect.fnUntraced(function* () { return Date.now(); });
// @lint-expect linteffect/no-date-now-in-effect
export const eager = Effect.fnUntracedEager(function* () { return Date.now(); });
