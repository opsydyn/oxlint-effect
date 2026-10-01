import { Context, Effect, Layer } from "effect";
const dependencyLayer = Layer.provide(Layer.empty, Layer.empty);
export class Direct extends Context.Service<Direct>()("Direct", { make: Effect.succeed({ value: 42, dependencyLayer }) }) {}
export const Functional = Context.Service<{ readonly functional: true }>()("Functional", { make: () => Effect.succeed({ value: 42, dependencyLayer }) });
export const Expression = class Expression extends Context.Service<Expression>()("Expression", { make: Effect.succeed({ value: 42, dependencyLayer }) }) {};
export const live = Layer.effect(Direct, Direct.make).pipe(Layer.provide(Layer.empty));
// Shape-level Layer values do not constitute make construction.
export const Key = Context.Service<{ readonly dependencyLayer: Layer.Layer<never> }>("Key");
export const KeyLive = Layer.succeed(Key, { dependencyLayer: Layer.provide(Layer.empty, Layer.empty) });
