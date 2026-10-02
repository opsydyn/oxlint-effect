import { Effect } from "effect";
const first = Effect.succeed(1);
// linteffect/no-call-tower: first or second direct argument only.
export const unary = Effect.asVoid(Effect.succeed(42));
export const mapped = Effect.map(Effect.succeed(1), n => n + 41);
export const second = Effect.andThen(first, Effect.succeed(42));
export const both = Effect.andThen(Effect.succeed(1), Effect.succeed(42));
// Each qualifying CallExpression reports, so this emits two.
export const three = Effect.map(Effect.map(Effect.succeed(1), n => n + 40), n => n + 1);
