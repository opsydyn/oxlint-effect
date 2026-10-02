import { Effect } from "effect";
import * as E from "effect/Effect";
export const task = Effect.gen(function*() {
  const n = yield* Effect.succeed(1);
  return n + 41;
});
const first = Effect.succeed(1);
const second = Effect.map(first, n => n + 40);
export const explicit = Effect.map(second, n => n + 1);
// Shallow nesting is permitted.
export const shallow = Effect.map(Effect.succeed(1), n => n + 41);
// Computed access and aliased namespaces are preserved syntax gaps, not repairs.
export const computed = Effect["map"](Effect["map"](Effect["succeed"](1), n => n + 40), n => n + 1);
export const alias = E.map(E.map(E.succeed(1), n => n + 40), n => n + 1);
