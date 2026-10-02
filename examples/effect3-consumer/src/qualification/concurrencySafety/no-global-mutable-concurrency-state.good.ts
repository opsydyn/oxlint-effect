import { Effect, Ref } from "effect";
// Allocate state per owner execution, not in a mutable module singleton.
export const count = Effect.gen(function* () { const ref = yield* Ref.make(0); yield* Effect.forEach([1, 2], () => Ref.update(ref, value => value + 1), { concurrency: 2 }); return yield* Ref.get(ref); });
export const values = Effect.forEach([1, 2], value => Effect.succeed(value), { concurrency: 2 });
const lookup = new Map([[1, 42]]);
export const readonlyUse = Effect.forEach([1], value => Effect.succeed(lookup.get(value)));
