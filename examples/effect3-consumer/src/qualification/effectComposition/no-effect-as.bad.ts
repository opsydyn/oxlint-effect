import { Effect } from "effect";
// EXPECT: linteffect/no-effect-as (data-first)
export const direct = Effect.as(Effect.succeed(1), "ready");
// EXPECT: linteffect/no-effect-as (piped)
export const piped = Effect.succeed(1).pipe(Effect.as("ready"));
