import { Effect, Layer } from "effect";
import { read, output, middle, source } from "./layer-graph";
// Repair: explicit provider order remains middle then source, outside workflow.
const live = output.pipe(Layer.provide(middle), Layer.provide(source));
const provided = read.pipe(Effect.provide(live));
export const direct = Effect.gen(function* () { return yield* provided; });
export const piped = direct;
export const assembled = direct;
