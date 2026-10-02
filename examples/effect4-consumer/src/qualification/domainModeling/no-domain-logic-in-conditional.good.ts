import { Effect } from "effect";
export { eligible } from "./domain-lifecycle";
export const two = (a: number, b: number) => a > 0 && b > 0;
// Hidden booleans remain clean without proving domain validation.
export const aliases = (a: boolean, b: boolean, c: boolean) => a && b && c;
export const task = Effect.succeed(42);
