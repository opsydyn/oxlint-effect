import { Effect } from "effect";
const failed = Effect.fail("source");
// EXPECT: linteffect/no-swallowed-catch-all (piped expression 0)
export const variant0 = failed.pipe(Effect.catchAll(() => Effect.succeed("fallback")));
// EXPECT: linteffect/no-swallowed-catch-all (piped expression 1)
export const variant1 = failed.pipe(Effect.catchAll(() => Effect.asVoid(Effect.succeed("fallback"))));
// EXPECT: linteffect/no-swallowed-catch-all (piped expression 2)
export const variant2 = failed.pipe(Effect.catchAll(() => Effect.ignore(Effect.fail("lost"))));
// EXPECT: linteffect/no-swallowed-catch-all (piped expression 3)
export const variant3 = failed.pipe(Effect.catchAll(() => Effect.void));
