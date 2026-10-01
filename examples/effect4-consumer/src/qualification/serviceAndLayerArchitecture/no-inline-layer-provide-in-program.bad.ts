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
const owner = { label: "workflow" };
// linteffect/no-inline-layer-provide-in-program: self-bound v4 generator.
export const bound = Effect.gen({ self: owner }, function* () { return yield* read.pipe(Effect.provide(live)); });
// linteffect/no-inline-layer-provide-in-program: named v4 generator Effect.fn.
export const traced = Effect.fn("Q15.workflow")(function* () { return yield* Effect.provide(read, live); });
