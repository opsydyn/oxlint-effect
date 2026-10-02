import { Effect } from "effect";
// linteffect/no-flatmap-ladder: input and callback nesting.
export const input = Effect.flatMap(Effect.flatMap(Effect.succeed(1), n => Effect.succeed(n + 40)), n => Effect.succeed(n + 1));
export const callback = Effect.flatMap(Effect.succeed(1), n => Effect.flatMap(Effect.succeed(n + 40), m => Effect.succeed(m + 1)));
export function flattened() { return Effect.flatten(Effect.map(Effect.succeed(1), n => Effect.succeed(n + 41))); }
export const left = Effect.flatMap(Effect.flatMap(Effect.succeed(1), n => Effect.succeed(n + 40)), n => Effect.succeed(n + 1)),
  right = Effect.flatten(Effect.map(Effect.succeed(1), n => Effect.succeed(n + 41)));
// Broad AST search reports even an unused inner callback. It does not execute.
export const unused = Effect.flatMap(Effect.succeed(1), n => {
  const never = () => Effect.flatMap(Effect.succeed(n), m => Effect.succeed(m + 41));
  return Effect.succeed(n + 41);
});
