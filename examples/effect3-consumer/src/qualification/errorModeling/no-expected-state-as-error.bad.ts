import { Effect } from "effect";
// EXPECT: linteffect/no-expected-state-as-error
export const notfound = Effect.fail("NotFound");
// EXPECT: linteffect/no-expected-state-as-error
export const missing = Effect.fail("Missing");
// EXPECT: linteffect/no-expected-state-as-error
export const empty = Effect.fail("Empty");
// EXPECT: linteffect/no-expected-state-as-error
export const none = Effect.fail("None");
