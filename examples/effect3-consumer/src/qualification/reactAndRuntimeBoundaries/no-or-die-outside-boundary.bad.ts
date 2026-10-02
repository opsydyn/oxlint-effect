import { Effect, pipe } from "effect";
export const original = { _tag: "Q49Failure" };
// linteffect/no-or-die-outside-boundary: converting typed failure into defect.
export const direct = Effect.orDie(Effect.fail(original));
export const member = Effect.fail(original).pipe(Effect.orDie);
export const free = pipe(Effect.fail(original), Effect.orDie);
export const withError = Effect.orDieWith(Effect.fail(original), error => error);
// Factory and pipe report separately.
export const curried = Effect.fail(original).pipe(Effect.orDieWith(error => error));
