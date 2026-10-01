import { Effect } from "effect";
// EXPECT: linteffect/no-effect-do (direct builder state)
export const direct = Effect.Do;
// EXPECT: linteffect/no-effect-do (builder pipeline)
export const piped = Effect.Do.pipe(Effect.bind("value", () => Effect.succeed(1)));
