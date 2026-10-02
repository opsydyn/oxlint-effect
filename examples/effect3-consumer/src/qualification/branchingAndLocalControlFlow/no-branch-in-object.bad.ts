import { Either, Match, Option } from "effect";
const some = Option.some(42), outcome = Either.right(42);
// linteffect/no-branch-in-object: property values recursively own decisions.
export const match = { value: Match.value(true).pipe(Match.when(true, () => 42), Match.orElse(() => 0)) };
export const option = { value: Option.match(some, { onNone: () => 0, onSome: n => n }) };
export const absent = { value: Option.match(Option.none<number>(), { onNone: () => 0, onSome: n => n }) };
export const result = { value: Either.match(outcome, { onLeft: () => 0, onRight: n => n }) };
// Nested object reports both outer and inner; multiple fields report once.
export const nested = { inner: { value: Option.match(some, { onNone: () => 0, onSome: n => n }) } };
export const many = { a: Option.match(some, { onNone: () => 0, onSome: n => n }), b: Match.value(true).pipe(Match.when(true, () => 42), Match.orElse(() => 0)) };
export const unused = { read: () => Option.match(some, { onNone: () => 0, onSome: n => n }) };
export const array = { values: [Option.match(some, { onNone: () => 0, onSome: n => n })] };
export const method = { read() { return Option.match(some, { onNone: () => 0, onSome: n => n }); } };
// Spread is ignored by the outer owner but its literal inner object reports.
export const spread = { ...{ value: Option.match(some, { onNone: () => 0, onSome: n => n }) } };
export const original = { _tag: "Q48Failure" };
export const failure = { error: Either.match(Either.left(original), { onLeft: error => error, onRight: n => n }) };
