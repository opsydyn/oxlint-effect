import { Option } from "effect";
// linteffect/no-fromnullable-nullish-coalesce: stable rule ID, own-major API.
export const nullWrap = <A>(input: A | null | undefined) => Option.fromNullable(input ?? null);
export const undefinedWrap = <A>(input: A | null | undefined) => Option.fromNullable(input ?? undefined);
export const nested = <A>(input: A | null | undefined) => Option.fromNullable((input ?? null) ?? undefined);
