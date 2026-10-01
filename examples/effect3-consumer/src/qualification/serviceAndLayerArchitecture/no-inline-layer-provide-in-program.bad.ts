import { Effect, Layer } from "effect";
import { read, output, middle, source } from "./layer-graph";
const live = output.pipe(Layer.provide(middle), Layer.provide(source));
// linteffect/no-inline-layer-provide-in-program: assembly is buried in the workflow.
export const direct = Effect.gen(function* () { return yield* Effect.provide(read, live); });
// linteffect/no-inline-layer-provide-in-program: data-last provisioning also counts.
export const piped = Effect.gen(function* () { return yield* read.pipe(Effect.provide(live)); });
// linteffect/no-inline-layer-provide-in-program: inline Layer.provide counts too.
export const assembled = Effect.gen(function* () {
  const local = Layer.provide(output, middle).pipe(Layer.provide(source));
  return yield* Effect.provide(read, local);
});
