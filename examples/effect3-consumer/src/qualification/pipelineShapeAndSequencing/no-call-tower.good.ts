import { Effect } from "effect";
import * as E from "effect/Effect";
const first = Effect.succeed(1);
export const flat = first.pipe(Effect.map(n => n + 41));
export const task = Effect.gen(function*() { const n = yield* first; return n + 41; });
// Aliased and computed calls are limitations, not recommended repairs.
export const aliased = E.map(E.succeed(1), n => n + 41);
export const computed = Effect["map"](Effect["succeed"](1), n => n + 41);
// Callback nesting is not a direct Effect argument and stays clean here.
export const callback = Effect.flatMap(first, n => Effect.succeed(n + 41));
// Ordinary same-name API: third argument is deliberately outside this rule.
export function thirdArgument() {
  const Effect = { succeed: (n: number) => n, choose: (_a: number, _b: number, c: number) => c };
  return Effect.choose(0, 0, Effect.succeed(42));
}
