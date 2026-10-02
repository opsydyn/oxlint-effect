import { Effect } from "effect";
export { decodeOptions } from "./domain-command";
// unknown is boundary input, not evidence that decoding occurred.
export const opaque = (options: unknown) => Effect.succeed(options);
type Bag = object;
export const alias = (options: Bag) => options;
export const unrelated = (input: object) => input;
export const defaulted = (options = {}) => options;
