import { Effect } from "effect";

// EXPECT: linteffect/no-mixed-effect-error-shapes
export function named(): Effect.Effect<string, Error | string> { return Effect.fail(new Error("source")); }
// EXPECT: linteffect/no-mixed-effect-error-shapes
export default function defaultOperation(): Effect.Effect<string, Error | string> { return Effect.fail(new Error("source")); }
// EXPECT: linteffect/no-mixed-effect-error-shapes
export const arrow = (): Effect.Effect<string, Error | string> => Effect.fail(new Error("source"));
// EXPECT: linteffect/no-mixed-effect-error-shapes
export const callable: () => Effect.Effect<string, Error | string> = () => Effect.fail(new Error("source"));
// EXPECT: linteffect/no-mixed-effect-error-shapes
export const expression = function (): Effect.Effect<string, Error | string> { return Effect.fail(new Error("source")); };
