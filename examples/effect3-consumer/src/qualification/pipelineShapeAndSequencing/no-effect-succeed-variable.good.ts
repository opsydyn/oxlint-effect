import { Effect, Match, Option } from "effect";
export const literal = Effect.succeed(42);
export const aggregate = Effect.succeed({ value: 42 });
export function select(enabled: boolean) {
  const selected = Match.value(enabled).pipe(Match.when(true, () => 42), Match.orElse(() => 0));
  return Effect.map(Effect.succeed(0), () => selected);
}
export function optional(value: Option.Option<number>) { return Option.match(value, { onNone: () => 0, onSome: n => n }); }
// Constructor-call/namespace aliases are shape gaps, not endorsed repairs.
export const called = Effect.succeed(Number(42));
