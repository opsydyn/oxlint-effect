import { Effect } from "effect";
// linteffect/no-unobserved-fiber: legacy direct initializer heuristic.
export const direct = () => { const firstFiber = Effect.fork(Effect.succeed(42)); return firstFiber; };
export const second = () => { const secondFiber = Effect.fork(Effect.succeed(42)); return secondFiber; };
export const third = () => { const thirdFiber = Effect.fork(Effect.succeed(42)); return thirdFiber; };
