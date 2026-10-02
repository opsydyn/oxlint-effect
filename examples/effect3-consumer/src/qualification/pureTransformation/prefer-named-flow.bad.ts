import { Effect, flow } from "effect";
import { increment, double, offset } from "./pure-steps";
// linteffect/prefer-named-flow: >=3 inline stages passed to any caller.
export const task = Effect.map(Effect.succeed(1), flow(increment, double, offset));
export const array = [1].map(flow(increment, double, offset));
const consume = (transform: (n: number) => number) => transform(1);
export const plain = consume(flow(increment, double, offset));
const two = (first: (n: number) => number, second: (n: number) => number) => first(1) + second(1);
// Only first qualifying inline flow is reported for this parent call.
export const multiple = two(flow(increment, double, offset), flow(increment, double, offset));
