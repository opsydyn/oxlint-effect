import { Match } from "effect";
// linteffect/no-unknown-boolean-coercion-helper: file-global correlation before/after marker.
export const before = (input: unknown) => typeof input === "boolean" ? input : null;
export const marker = (input: unknown) => Match.value(input).pipe(Match.when((value: unknown) => value === true, () => true), Match.orElse(() => null));
export const after = (input: unknown) => typeof input === "boolean" ? input : null;
// Unrelated check also warns, even without service context.
export const ordinary = (input: unknown) => typeof input === "boolean";
export const secondMarker = (input: unknown) => Match.value(input).pipe(Match.when((value: unknown) => value === true, () => true), Match.orElse(() => null));
