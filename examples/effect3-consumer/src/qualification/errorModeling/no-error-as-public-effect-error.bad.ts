import { Effect } from "effect";

// EXPECT: linteffect/no-error-as-public-effect-error
export function named(): Effect.Effect<string, Error> { return Effect.fail(new Error("source")); }
// EXPECT: linteffect/no-error-as-public-effect-error
export default function defaultOperation(): Effect.Effect<string, Error> { return Effect.fail(new Error("source")); }
// EXPECT: linteffect/no-error-as-public-effect-error
export const arrow = (): Effect.Effect<string, Error> => Effect.fail(new Error("source"));
// EXPECT: linteffect/no-error-as-public-effect-error
export const callable: () => Effect.Effect<string, Error> = () => Effect.fail(new Error("source"));
// EXPECT: linteffect/no-error-as-public-effect-error
export const expression = function (): Effect.Effect<string, Error> { return Effect.fail(new Error("source")); };
