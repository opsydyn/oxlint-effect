import { Effect } from "effect";
import * as E from "effect/Effect";
// Actual repair: pure domain data, Effect construction at the call site.
export const transform = (n: number) => n + 41;
export const value = transform(1);
export const task = Effect.succeed(value);
// Direct constructors are not wrapper aliases under the current syntax policy.
export const generator = Effect.gen(function*() { const n = yield* task; return n; });
// Block-arrow/namespace alias shapes remain gaps, not recommended repairs.
export const block = () => { return Effect.succeed(42); };
export const alias = () => E.succeed(42);
