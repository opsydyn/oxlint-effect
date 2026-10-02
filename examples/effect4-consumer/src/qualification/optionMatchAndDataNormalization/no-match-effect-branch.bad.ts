import { Effect, Match, Option } from "effect";
// linteffect/no-match-effect-branch: value().pipe branch and Option.match branches.
export const match = (value: boolean) => Match.value(value).pipe(Match.when(true, () => Effect.map(Effect.succeed(1), n => n + 41)), Match.orElse(() => Effect.succeed(0)));
export const pipe = (value: boolean) => Match.value(value).pipe(Match.when(true, () => Effect.succeed(1).pipe(Effect.andThen(() => Effect.succeed(42)))), Match.orElse(() => Effect.succeed(0)));
export const option = (value: Option.Option<number>) => Option.match(value, { onNone: () => Effect.succeed(0), onSome: n => Effect.map(Effect.succeed(n), n => n + 41) });
