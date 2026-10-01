import { Effect } from "effect";
// linteffect/no-fire-and-forget-fork: a bare constructor is discarded, not executed.
export function discardedConstructors(task: Effect.Effect<number> = Effect.succeed(42)) { Effect.fork(task); }
