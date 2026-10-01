import { Effect, Layer } from "effect";
// linteffect/no-layer-provide-in-service-definition: inline construction wiring.
export class Direct extends Effect.Service<Direct>()("Direct", {
  effect: Effect.sync(() => ({ value: 42, dependencyLayer: Layer.provide(Layer.empty, Layer.empty) }))
}) {}
// linteffect/no-layer-provide-in-service-definition: piped wiring in sync builder.
export class Piped extends Effect.Service<Piped>()("Piped", {
  sync: () => ({ value: 42, dependencyLayer: Layer.empty.pipe(Layer.provide(Layer.empty)) })
}) {}
