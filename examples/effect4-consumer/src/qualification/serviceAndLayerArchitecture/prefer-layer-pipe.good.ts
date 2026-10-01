import { Layer } from "effect";
import { source, middle, output } from "./layer-graph";
export const two = output.pipe(Layer.provide(middle), Layer.provide(source));
export const three = output.pipe(Layer.provide(middle), Layer.provide(source), Layer.provide(Layer.empty));
export const single = Layer.provide(source, Layer.empty);
// Nested provider argument is outside the existing first-argument tower heuristic.
export const provider = Layer.provide(output, Layer.provide(middle, source));
