import { Effect, Match } from "effect";
// linteffect/no-match-void-branch: literal booleans and immediate Effect.void.
export const truth = (value: boolean) => Match.value(value).pipe(Match.when(true, () => Effect.void), Match.orElse(() => Effect.succeed(42)));
export const falsity = (value: boolean) => Match.value(value).pipe(Match.when(false, () => Effect.void), Match.orElse(() => Effect.succeed(42)));
export const fallback = (value: boolean) => Match.value(value).pipe(Match.when(true, () => Effect.succeed(42)), Match.orElse(() => Effect.void));
