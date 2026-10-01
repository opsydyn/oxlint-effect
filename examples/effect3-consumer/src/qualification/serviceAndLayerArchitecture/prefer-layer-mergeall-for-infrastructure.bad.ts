import { Layer } from "effect";
import { a, b, c, d } from "./infrastructure-graph";
// linteffect/prefer-layer-mergeall-for-infrastructure: one nested merge.
export const two = Layer.merge(Layer.merge(a, b), Layer.merge(c, d));
// linteffect/prefer-layer-mergeall-for-infrastructure: two nested parents.
export const three = Layer.merge(Layer.merge(Layer.merge(a, b), c), d);
