import { Effect } from "effect";
// @lint-expect linteffect/no-console-in-effect-flow (eight common constructor call sites).
export const sync = Effect.sync(() => { console.warn("raw"); return 42; });
export const gen = Effect.gen(function* () { console.warn("raw"); return 42; });
export const attempt = Effect.try(() => { console.warn("raw"); return 42; });
export const promise = Effect.tryPromise(() => { console.warn("raw"); return Promise.resolve(42); });
export const fn = Effect.fn(function* () { console.warn("raw"); return 42; });
export const named = Effect.fn("Q28Console")(function* () { console.warn("raw"); return 42; });
export const nested = Effect.gen(function* () { return yield* Effect.sync(() => { console.warn("raw"); return 42; }); });
// Retained conservative warning: this callback is never invoked.
export const unused = Effect.gen(function* () { const neverCalled = () => console.warn("raw"); void neverCalled; return 42; });
// @lint-expect linteffect/no-console-in-effect-flow (service implementation methods).
export class ConsoleService extends Effect.Service<ConsoleService>()("Q28Console", { effect: Effect.succeed({ load: () => { console.warn("raw"); return Effect.succeed(42); } }) }) {}
// Legacy policy retains its untraced-constructor gap.
export const untraced = Effect.fnUntraced(function* () { console.warn("raw"); return 42; });
