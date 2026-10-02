import { Effect, flow } from "effect";
import { increment, double, offset } from "./pure-steps";
export const transform = flow(increment, double, offset);
export const task = Effect.map(Effect.succeed(1), transform);
export const array = [1].map(transform);
export const short = Effect.map(Effect.succeed(1), flow(n => n + 1, n => n + 40));
