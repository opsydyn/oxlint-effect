import { Effect, pipe } from "effect";
export const original = { _tag: "Q49Failure" };
// linteffect/no-or-die-outside-boundary: converting typed failure into defect.
export const direct = Effect.orDie(Effect.fail(original));
export const member = Effect.fail(original).pipe(Effect.orDie);
export const free = pipe(Effect.fail(original), Effect.orDie);
