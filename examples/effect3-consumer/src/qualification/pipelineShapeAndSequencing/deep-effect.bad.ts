import { Effect } from "effect";
// linteffect/no-nested-effect-call and no-effect-ladder: three constructors.
export const assigned = Effect.map(Effect.map(Effect.succeed(1), n => n + 40), n => n + 1);
// Depth four: two CallExpression reports, one initialiser report.
export const four = Effect.map(Effect.map(Effect.map(Effect.succeed(1), n => n + 39), n => n + 1), n => n + 1);
export function returned() { return Effect.map(Effect.map(Effect.succeed(1), n => n + 40), n => n + 1); }
// Concise body and standalone expression: only no-nested-effect-call owns these.
export const concise = () => Effect.map(Effect.map(Effect.succeed(1), n => n + 40), n => n + 1);
Effect.map(Effect.map(Effect.succeed(1), n => n + 40), n => n + 1);
// Both declarators are visited.
export const left = Effect.map(Effect.map(Effect.succeed(1), n => n + 40), n => n + 1),
  right = Effect.map(Effect.map(Effect.succeed(1), n => n + 40), n => n + 1);
