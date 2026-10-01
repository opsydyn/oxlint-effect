import { Effect } from "effect";
const failed = Effect.fail("source");
// EXPECT: linteffect/no-swallowed-catch-all (catch expression 0)
export const variant0_0 = Effect.catch(failed, () => Effect.succeed("fallback"));
// EXPECT: linteffect/no-swallowed-catch-all (catch piped block 0)
export const block0_0 = failed.pipe(Effect.catch(() => { return Effect.succeed("fallback"); }));
// EXPECT: linteffect/no-swallowed-catch-all (catchEager expression 0)
export const variant0_1 = Effect.catchEager(failed, () => Effect.succeed("fallback"));
// EXPECT: linteffect/no-swallowed-catch-all (catchEager piped block 0)
export const block0_1 = failed.pipe(Effect.catchEager(() => { return Effect.succeed("fallback"); }));
// EXPECT: linteffect/no-swallowed-catch-all (catch expression 1)
export const variant1_0 = Effect.catch(failed, () => Effect.asVoid(Effect.succeed("fallback")));
// EXPECT: linteffect/no-swallowed-catch-all (catch piped block 1)
export const block1_0 = failed.pipe(Effect.catch(() => { return Effect.asVoid(Effect.succeed("fallback")); }));
// EXPECT: linteffect/no-swallowed-catch-all (catchEager expression 1)
export const variant1_1 = Effect.catchEager(failed, () => Effect.asVoid(Effect.succeed("fallback")));
// EXPECT: linteffect/no-swallowed-catch-all (catchEager piped block 1)
export const block1_1 = failed.pipe(Effect.catchEager(() => { return Effect.asVoid(Effect.succeed("fallback")); }));
// EXPECT: linteffect/no-swallowed-catch-all (catch expression 2)
export const variant2_0 = Effect.catch(failed, () => Effect.ignore(Effect.fail("lost")));
// EXPECT: linteffect/no-swallowed-catch-all (catch piped block 2)
export const block2_0 = failed.pipe(Effect.catch(() => { return Effect.ignore(Effect.fail("lost")); }));
// EXPECT: linteffect/no-swallowed-catch-all (catchEager expression 2)
export const variant2_1 = Effect.catchEager(failed, () => Effect.ignore(Effect.fail("lost")));
// EXPECT: linteffect/no-swallowed-catch-all (catchEager piped block 2)
export const block2_1 = failed.pipe(Effect.catchEager(() => { return Effect.ignore(Effect.fail("lost")); }));
// EXPECT: linteffect/no-swallowed-catch-all (catch expression 3)
export const variant3_0 = Effect.catch(failed, () => Effect.void);
// EXPECT: linteffect/no-swallowed-catch-all (catch piped block 3)
export const block3_0 = failed.pipe(Effect.catch(() => { return Effect.void; }));
// EXPECT: linteffect/no-swallowed-catch-all (catchEager expression 3)
export const variant3_1 = Effect.catchEager(failed, () => Effect.void);
// EXPECT: linteffect/no-swallowed-catch-all (catchEager piped block 3)
export const block3_1 = failed.pipe(Effect.catchEager(() => { return Effect.void; }));
