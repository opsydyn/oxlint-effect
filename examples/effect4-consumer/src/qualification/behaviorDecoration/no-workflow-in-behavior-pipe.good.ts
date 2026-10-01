import { Effect } from "effect";
const workflow = Effect.gen(function* () { const value = yield* Effect.succeed("ready"); return yield* Effect.succeed(value); });
// CLEAN: named workflow with behaviour around it, not inside it.
export const decorated = workflow.pipe(Effect.withSpan("lookup"), Effect.timeout("1 second"));
// CLEAN: one sequencing step stays below the workflow threshold.
export const single = Effect.succeed("ready").pipe(Effect.flatMap((value) => Effect.succeed(value)), Effect.withSpan("lookup"));
