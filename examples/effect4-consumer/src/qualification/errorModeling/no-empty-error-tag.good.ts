import { Data, Effect, Option } from "effect";
export type MissingError = { readonly _tag: "Missing"; readonly entityId: string };
export interface EmptyFailure { readonly _tag: "Empty"; readonly operation: string }
export class ValidationError extends Data.TaggedError("ValidationError")<{ readonly field: string; readonly cause: unknown }> {}
export const source = new Error("invalid");
export const failed = Effect.fail(new ValidationError({ field: "userId", cause: source }));
export const absence = Effect.succeed(Option.none<string>());
export type ExpectedState = { readonly _tag: "Empty" };
