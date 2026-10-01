import { Context, Effect, Layer } from "effect";
import { original } from "./method-failure";
export class Traced extends Context.Service<Traced>()("Q14Traced", { make: Effect.fn("Q14Make")(function* () { return { load: () => Effect.succeed(42) }; }) }) {}
export class Annotated extends Context.Service<Annotated>()("Q14Annotated", { make: Effect.gen(function* () { return { load: () => Effect.succeed(42) }; }) }) {}
export const AsyncKey = Context.Service<{ readonly asyncKey: true }>()("Q14Async", { make: () => Effect.sync(() => ({ load: () => Effect.sync(() => 42) })) });
export const Chained = class Chained extends Context.Service<Chained>()("Q14Chained", { make: Effect.succeed({ load: () => Effect.promise(() => Promise.resolve(42).then(n => n)) }) }) {};
export class Constructed extends Context.Service<Constructed>()("Q14Constructed", { make: Effect.succeed({ load: () => Effect.tryPromise({ try: () => new Promise<number>(resolve => resolve(42)), catch: cause => cause }) }) }) {}
export class Rejected extends Context.Service<Rejected>()("Q14Rejected", { make: Effect.succeed({ load: () => Effect.fail(original) }) }) {}
export const AnnotatedLive = Layer.effect(Annotated, Annotated.make);
// Promise adapter callbacks are not service methods; unused local callbacks do not set a method's return type.
export class OwnScope extends Context.Service<OwnScope>()("Q14OwnScope", { make: Effect.succeed({ load: () => { const unused = () => Promise.resolve(1); void unused; return Effect.succeed(42); } }) }) {}
// Named builder aliases are deliberately outside literal construction recognition.
const namedMake = Effect.succeed({ load: () => Effect.succeed(42) });
export class Named extends Context.Service<Named>()("Q14Named", { make: namedMake }) {}
