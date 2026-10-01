import { Effect, Layer, flow } from "effect";
// linteffect/no-mixed-pillar-function: workflow, transformation and recovery mixed in each function.
// Layer construction is the fourth possible pillar, independent of recovery.
export function mixedLayer() {
  const shape = flow((n: number) => n + 1);
  return { layer: Layer.mergeAll(Layer.empty), program: Effect.gen(function* () { return shape(yield* Effect.succeed(1)); }) };
}
export function mixedDeclaration() {
  const shape = flow((n: number) => n + 1);
  return Effect.catchAll(Effect.gen(function* () { return shape(yield* Effect.succeed(1)); }), () => Effect.succeed(2));
}
export const mixedArrow = () => {
  const shape = flow((n: number) => n + 1);
  return Effect.catchAll(Effect.gen(function* () { return shape(yield* Effect.succeed(1)); }), () => Effect.succeed(2));
};
export const mixedExpression = function () {
  const shape = flow((n: number) => n + 1);
  return Effect.catchAll(Effect.gen(function* () { return shape(yield* Effect.succeed(1)); }), () => Effect.succeed(2));
};
