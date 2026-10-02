import { Option } from "effect";
export const direct = <A>(input: A | null | undefined) => Option.fromNullable(input);
// Aliased source/member gap, not a changed absence contract.
const wrap = Option.fromNullable;
export const opaque = <A>(input: A | null | undefined) => wrap(input ?? null);
export const stored = <A>(input: A | null | undefined) => { const normalized = input ?? null; return Option.fromNullable(normalized); };
