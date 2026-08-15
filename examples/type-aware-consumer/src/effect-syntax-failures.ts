import { Effect } from "effect";

// EXPECT: linteffect/prefer-pipe-for-behavior
// EXPECT: linteffect/no-effect-as
// EXPECT: linteffect/no-call-tower
// QA: Existing syntax-only Effect rule must still run when typeAware is enabled.
export const mapped = Effect.as(Effect.succeed(1), 2);
