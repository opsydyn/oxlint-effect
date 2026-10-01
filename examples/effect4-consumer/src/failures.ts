import { Effect } from "effect";

export const sourceError = new Error("operation failed");
// EXPECT: linteffect/no-effect-fail-error-message
export const failureOne = Effect.fail(sourceError.message);
// EXPECT: linteffect/no-effect-fail-error-message
export const failureTwo = Effect.fail(sourceError.message);
