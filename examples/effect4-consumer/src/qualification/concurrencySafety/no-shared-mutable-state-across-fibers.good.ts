import { Effect, Fiber, Ref } from "effect";
// Atomic update keeps the read-modify-write inside one Ref operation.
export const count = Effect.gen(function* () {
  const completed = yield* Ref.make(0);
  yield* Effect.forEach([1, 2], () => Ref.update(completed, value => value + 1), { concurrency: 2 });
  return yield* Ref.get(completed);
});
export const values = Effect.forEach([1, 2], value => Effect.succeed(value), { concurrency: 2 });
// Worker-local state has no shared lexical binding.
export const local = Effect.forkChild(Effect.sync(() => { let completed = 0; completed++; return completed; }));
export const observedLocal = Effect.gen(function* () { const fiber = yield* local; return yield* Fiber.join(fiber); });
let completed = 42;
export const outerValue = () => completed;
export const shadow = Effect.forkChild(Effect.sync(() => { let completed = 0; completed++; return completed; }));
// Parameters shadow outer state too; their binding is not the outer let.
export const parameter = Effect.forEach([1, 2], completed => Effect.sync(() => ++completed), { concurrency: 2 });
// Known syntax limit: const containers and property assignments are not covered.
const container: number[] = [];
export const constContainer = Effect.forEach([1], value => Effect.sync(() => container.push(value)));
