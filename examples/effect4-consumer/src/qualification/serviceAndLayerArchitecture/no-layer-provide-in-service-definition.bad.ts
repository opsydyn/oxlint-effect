import { Context, Effect, Layer } from "effect";
// linteffect/no-layer-provide-in-service-definition: class effect make.
export class Direct extends Context.Service<Direct>()("Direct", {
  make: Effect.sync(() => ({ value: 42, dependencyLayer: Layer.provide(Layer.empty, Layer.empty) }))
}) {}
// linteffect/no-layer-provide-in-service-definition: function make on a service key.
export const Functional = Context.Service<{ readonly functional: true }>()("Functional", {
  make: () => Effect.succeed({ value: 42, dependencyLayer: Layer.empty.pipe(Layer.provide(Layer.empty)) })
});
// linteffect/no-layer-provide-in-service-definition: class expression.
export const Expression = class Expression extends Context.Service<Expression>()("Expression", {
  make: Effect.succeed({ value: 42, dependencyLayer: Layer.provide(Layer.empty, Layer.empty) })
}) {};
