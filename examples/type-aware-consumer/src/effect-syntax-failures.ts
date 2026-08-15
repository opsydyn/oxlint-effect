import { Effect } from "effect";

// EXPECT: linteffect/no-effect-as
// QA: Existing syntax-only Effect rule must still run when typeAware is enabled.
export const mapped = Effect.as(Effect.succeed(1), 2);
