import { Effect, Layer } from "effect";
import { a, b, c, readA } from "./infrastructure-graph";
import { source } from "./layer-graph";
// Repair: group independent layers, preserving explicit provision.
export const InfrastructureLive = Layer.mergeAll(a, b, c).pipe(Layer.provide(source));
export const ProgramLayer = Effect.provide(readA, InfrastructureLive);
// Clean threshold and naming controls: two matching declarations are allowed.
export const ordinary = Effect.provide(readA, a);
