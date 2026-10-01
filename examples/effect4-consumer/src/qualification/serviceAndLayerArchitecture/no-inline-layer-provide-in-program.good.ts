import { Effect, Layer } from "effect";
import { read, output, middle, source } from "./layer-graph";
// Repair: explicit provider order remains middle then source, outside workflow.
const live = output.pipe(Layer.provide(middle), Layer.provide(source));
const provided = read.pipe(Effect.provide(live));
export const direct = Effect.gen(function* () { return yield* provided; });
export const piped = direct;
export const assembled = direct;
const owner = { label: "workflow" };
export const bound = Effect.gen({ self: owner }, function* () { return yield* provided; });
export const traced = Effect.fn("Q15.workflow")(function* () { return yield* provided; });
// Clean v4 scope control: this helper is not invoked by this generator.
export const nested = Effect.gen(function* () {
  const unused = () => Effect.provide(read, live);
  void unused;
  return yield* provided;
});
