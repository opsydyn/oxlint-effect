import { Effect, Option } from "effect";
// Absence is modelled as data; only encode null at the wire boundary.
export const absent = () => Option.none<number>();
export const present = () => Option.some(42);
export const task = Effect.succeed(Option.none<number>());
// Concise null, a stored null identifier and object values are scope gaps.
export const concise = () => null;
const sentinel = null;
export function opaque() { return sentinel; }
export const data = { missing: null };
