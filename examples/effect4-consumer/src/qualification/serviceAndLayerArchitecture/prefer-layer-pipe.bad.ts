import { Layer } from "effect";
import { source, middle, output } from "./layer-graph";
// linteffect/prefer-layer-pipe: nested first-argument provisioning reports the inner call.
export const two = Layer.provide(Layer.provide(output, middle), source);
// linteffect/prefer-layer-pipe: three-level tower reports two inner calls.
export const three = Layer.provide(Layer.provide(Layer.provide(output, middle), source), Layer.empty);
