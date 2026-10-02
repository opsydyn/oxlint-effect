import { Context, Effect } from "effect";
export const program = Effect.succeed(42);
// Aliased runners are outside this literal namespace policy, not an ownership repair.
const execute = Effect.runSync;
export const opaque = () => execute(program);
// Factory creation is not execution.
export const factory = Effect.runPromiseWith(Context.empty());
