import { Effect, Layer } from "effect";
const dependencyLayer = Layer.provide(Layer.empty, Layer.empty);
export class Direct extends Effect.Service<Direct>()("Direct", { effect: Effect.succeed({ value: 42, dependencyLayer }) }) {}
export class Piped extends Effect.Service<Piped>()("Piped", { sync: () => ({ value: 42, dependencyLayer }) }) {}
// Boundary layer composition is legitimate.
export const live = Direct.Default.pipe(Layer.provide(Layer.empty));
