import { flow } from "effect";
import { increment, double, offset, identity } from "./pure-steps";
const first = flow(increment, double, offset);
const second = flow(identity, identity);
export const split = flow(first, second);
export const four = flow(increment, double, offset, identity);
// Aliased flow remains outside literal-name policy.
const compose = flow;
export const opaque = compose(increment, double, offset, identity, identity);
