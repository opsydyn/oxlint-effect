import { Layer } from "effect";
import { a, b, c, d } from "./infrastructure-graph";
// Repair only independent service layers; do not flatten provider dependencies.
export const two = Layer.mergeAll(a, b, c, d);
export const three = Layer.mergeAll(a, b, c, d);
// Clean: a single binary merge is allowed.
export const pair = Layer.merge(a, b);
