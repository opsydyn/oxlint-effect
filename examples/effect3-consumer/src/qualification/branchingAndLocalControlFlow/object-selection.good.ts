import { Either, Match, Option, pipe } from "effect";
import { Option as O } from "effect";
const some = Option.some(42);
const selected = Option.match(some, { onNone: () => 0, onSome: n => n });
export const value = { value: selected };
export function option(value: Option.Option<number>) { const selected = Option.match(value, { onNone: () => 0, onSome: n => n }); return { value: selected }; }
export const nested = { inner: { value: selected } };
export const many = { a: selected, b: selected };
export const array = { values: [selected] };
export function repairedFailure(error: object) {
  const selected = Either.match(Either.left(error), { onLeft: e => e, onRight: n => n });
  return { error: selected };
}
// These are scope gaps, not working repairs: keys, aliases, computed and free pipe.
export const key = { [Option.match(Option.some("value"), { onNone: () => "missing", onSome: n => n })]: 42 };
export const alias = { value: O.match(some, { onNone: () => 0, onSome: n => n }) };
export const computed = { value: Option["match"](some, { onNone: () => 0, onSome: n => n }) };
export const free = { value: pipe(Match.value(true), Match.when(true, () => 42), Match.orElse(() => 0)) };
const read = () => Option.match(some, { onNone: () => 0, onSome: n => n });
export const opaque = { read };
