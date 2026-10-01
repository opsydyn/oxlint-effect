import { Data } from "effect";
export class Failure extends Data.TaggedError("Q14Failure")<{ readonly operation: string }> {}
export const original = new Failure({ operation: "load" });
