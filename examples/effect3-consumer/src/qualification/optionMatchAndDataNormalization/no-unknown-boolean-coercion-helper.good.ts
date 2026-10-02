import { Match } from "effect";
export { decodeFlags } from "./decoded-model";
// Exact marker/check shapes matter; no correlation or type proof is performed.
export const reversed = (input: unknown) => "boolean" === typeof input;
export const loose = (input: unknown) => typeof input == "boolean";
export const inequality = (input: unknown) => typeof input !== "boolean";
export const blockMarker = (input: unknown) => Match.value(input).pipe(Match.when((value: unknown) => value === true, () => true), Match.orElse(() => { return null; }));
export const uncorrelated = (input: unknown) => typeof input === "boolean";
