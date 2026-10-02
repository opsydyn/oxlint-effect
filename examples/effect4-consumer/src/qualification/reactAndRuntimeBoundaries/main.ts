import { Effect } from "effect";
// Historical policy is path-unaware: even main.ts warns unless overridden off.
export const boundary = Effect.orDie(Effect.fail({ _tag: "Q49Failure" }));
