import { Effect, Fiber, pipe } from "effect";
// linteffect/no-fork-in-loop: retained handles still have no collection budget.
export const counted = Effect.gen(function* () {
  const fibers: Array<Fiber.Fiber<number>> = [];
  for (let index = 0; index < 3; index++) fibers.push(yield* Effect.forkChild(Effect.succeed(index + 1), { startImmediately: true }));
  return yield* Effect.forEach(fibers, Fiber.join);
});
// linteffect/no-fork-in-loop: for...of.
export const values = Effect.gen(function* () {
  const fibers: Array<Fiber.Fiber<number>> = [];
  for (const value of [1, 2, 3]) fibers.push(yield* Effect.succeed(value).pipe(Effect.forkChild));
  return yield* Effect.forEach(fibers, Fiber.join);
});
// linteffect/no-fork-in-loop: for...in.
export const keys = Effect.gen(function* () {
  const fibers: Array<Fiber.Fiber<number>> = [];
  for (const key in [1, 2, 3]) fibers.push(yield* pipe(Effect.succeed(Number(key) + 1), Effect.forkDetach({ startImmediately: true })));
  return yield* Effect.forEach(fibers, Fiber.join);
});
// linteffect/no-fork-in-loop: while.
export const whileLoop = Effect.gen(function* () {
  const fibers: Array<Fiber.Fiber<number>> = [];
  let index = 0;
  while (index < 3) fibers.push(yield* Effect.forkDetach(Effect.succeed(index++ + 1), { startImmediately: true }));
  return yield* Effect.forEach(fibers, Fiber.join);
});
// linteffect/no-fork-in-loop: do...while.
export const doLoop = Effect.gen(function* () {
  const fibers: Array<Fiber.Fiber<number>> = [];
  let index = 0;
  do { fibers.push(yield* Effect.succeed(index++ + 1).pipe(Effect.forkChild({ startImmediately: true }))); } while (index < 3);
  return yield* Effect.forEach(fibers, Fiber.join);
});
