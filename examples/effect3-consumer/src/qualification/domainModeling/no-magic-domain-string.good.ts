import { Effect } from "effect";
export { score } from "./domain-vocabulary";
// Clean controls include typeof exclusion and hidden string vocabulary.
const approved = "approved";
export const hidden = (status: string) => status === approved;
export const shape = (value: unknown) => typeof value === "boolean";
export const numeric = (value: number) => value === 42;
export const task = Effect.succeed(42);
