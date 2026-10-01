import { Effect } from "effect";

// EXPECT: linteffect/no-public-generic-effect-error
export function named(): Effect.Effect<string, Error> { return Effect.fail(new Error("source")); }
// EXPECT: linteffect/no-public-generic-effect-error
export default function defaultOperation(): Effect.Effect<string, Error> { return Effect.fail(new Error("source")); }
// EXPECT: linteffect/no-public-generic-effect-error
export const arrow = (): Effect.Effect<string, Error> => Effect.fail(new Error("source"));
// EXPECT: linteffect/no-public-generic-effect-error
export const callable: () => Effect.Effect<string, Error> = () => Effect.fail(new Error("source"));
// EXPECT: linteffect/no-public-generic-effect-error
export const expression = function (): Effect.Effect<string, Error> { return Effect.fail(new Error("source")); };
