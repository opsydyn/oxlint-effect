import { Effect, flow } from "effect";
import * as Fx from "effect/Effect";
import { increment, double, offset } from "./pure-steps";
export const pure = flow(increment, double, offset);
export const outside = (n: number) => Effect.map(Effect.succeed(n), pure);
// Named callbacks and alias operators can still return Effect: clean gaps.
const effectful = (n: number) => Effect.succeed(n + 41);
export const named = flow(effectful);
export const alias = flow((n: number) => Fx.succeed(n + 41));
