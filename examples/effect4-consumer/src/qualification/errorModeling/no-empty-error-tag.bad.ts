import { Data } from "effect";
// EXPECT: linteffect/no-empty-error-tag
export type MissingError = { readonly _tag: "Missing" };
// EXPECT: linteffect/no-empty-error-tag
export interface EmptyFailure { readonly _tag: "Empty" }
// EXPECT: linteffect/no-empty-error-tag
export class EmptyError extends Data.TaggedError("EmptyError")<{}> {}
