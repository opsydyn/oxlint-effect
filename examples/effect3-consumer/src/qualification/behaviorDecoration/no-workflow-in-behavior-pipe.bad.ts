import { Effect } from "effect";
// EXPECT: linteffect/no-workflow-in-behavior-pipe (two workflow steps plus span)
export const workflow = Effect.succeed("ready").pipe(Effect.flatMap((value) => Effect.succeed(value)), Effect.andThen((value) => Effect.succeed(value)), Effect.withSpan("lookup"));
