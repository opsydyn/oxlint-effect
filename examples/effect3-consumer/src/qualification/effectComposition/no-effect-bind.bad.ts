import { Effect } from "effect";
// EXPECT: linteffect/no-effect-bind (data-first)
export const direct = Effect.bind(Effect.Do, "value", () => Effect.succeed(1));
// EXPECT: linteffect/no-effect-bind (piped)
export const piped = Effect.Do.pipe(Effect.bind("value", () => Effect.succeed(1)));
