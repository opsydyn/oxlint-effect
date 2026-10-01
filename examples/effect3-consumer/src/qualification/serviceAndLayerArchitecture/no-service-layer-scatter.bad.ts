import { Effect, Layer } from "effect";
import { a, b, c, readA } from "./infrastructure-graph";
import { source } from "./layer-graph";
export const FirstLive = Layer.provide(a, source);
export const SecondLayer = Layer.provide(b, source);
// linteffect/no-service-layer-scatter: third matching declaration in this file.
export const ThirdLive = Layer.provide(c, source);
// linteffect/no-service-layer-scatter: Effect.provide and suffix naming count too.
export const FourthLayer = Effect.provide(readA, a);
