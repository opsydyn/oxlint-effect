import { Context, Effect } from "effect";
import { original } from "./method-failure";
// linteffect/no-service-method-returning-promise: named Effect.fn make factory.
export class Traced extends Context.Service<Traced>()("Q14Traced", { make: Effect.fn("Q14Make")(function* () { return { load: () => Promise.resolve(42) }; }) }) {}
// linteffect/no-service-method-returning-promise: generator make returns an annotated method.
export class Annotated extends Context.Service<Annotated>()("Q14Annotated", { make: Effect.gen(function* () { return { load: (): Promise<number> => Promise.resolve(42) }; }) }) {}
// linteffect/no-service-method-returning-promise: function make and async method, without explicit Promise syntax.
export const AsyncKey = Context.Service<{ readonly asyncKey: true }>()("Q14Async", { make: () => Effect.sync(() => ({ load: async () => 42 })) });
// linteffect/no-service-method-returning-promise: class expression and visible Promise chain.
export const Chained = class Chained extends Context.Service<Chained>()("Q14Chained", { make: Effect.succeed({ load: () => Promise.resolve(42).then(n => n) }) }) {};
// linteffect/no-service-method-returning-promise: constructor method.
export class Constructed extends Context.Service<Constructed>()("Q14Constructed", { make: Effect.succeed({ load: () => new Promise<number>(resolve => resolve(42)) }) }) {}
// linteffect/no-service-method-returning-promise: block return with original failure.
export class Rejected extends Context.Service<Rejected>()("Q14Rejected", { make: Effect.succeed({ load: () => { return Promise.reject(original); } }) }) {}
