import { Effect } from "effect";

// EXPECT: linteffect/no-unknown-public-error-channel
export function named(): Effect.Effect<string, unknown> { return Effect.fail(new Error("source")); }
// EXPECT: linteffect/no-unknown-public-error-channel
export default function defaultOperation(): Effect.Effect<string, unknown> { return Effect.fail(new Error("source")); }
// EXPECT: linteffect/no-unknown-public-error-channel
export const arrow = (): Effect.Effect<string, unknown> => Effect.fail(new Error("source"));
// EXPECT: linteffect/no-unknown-public-error-channel
export const callable: () => Effect.Effect<string, unknown> = () => Effect.fail(new Error("source"));
// EXPECT: linteffect/no-unknown-public-error-channel
export const expression = function (): Effect.Effect<string, unknown> { return Effect.fail(new Error("source")); };
