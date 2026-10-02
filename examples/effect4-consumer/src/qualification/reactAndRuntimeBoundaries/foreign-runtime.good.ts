import { Effect } from "effect";
// Local foreign shape, not current Runtime/orDieWith API qualification.
const Runtime = { runFork: (value: number) => value };
export const fork = Runtime.runFork(42);
const legacy = { orDieWith: (value: number) => value };
export function removed() { const Effect = legacy; return Effect.orDieWith(42); }
export const task = Effect.succeed(42);
