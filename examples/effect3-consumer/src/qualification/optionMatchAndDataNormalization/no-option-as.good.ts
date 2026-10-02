import { Option } from "effect";
export const direct = Option.map(Option.some(1), () => 42);
export const absent = Option.map(Option.none<number>(), () => 42);
export const select = (value: Option.Option<number>) => Option.match(value, { onNone: () => 0, onSome: () => 42 });
// Aliased member is clean syntax, not selection evidence.
const as = Option.as;
export const opaque = as(Option.some(1), 42);
