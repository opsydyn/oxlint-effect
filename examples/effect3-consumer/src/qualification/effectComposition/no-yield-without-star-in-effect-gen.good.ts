import { Effect } from "effect";
// CLEAN: delegation infers the resumed value.
export const delegated = Effect.gen(function* () { const value = yield* Effect.succeed("ready"); return value; });
const normalGenerator = function* () { yield "ordinary"; };
export const unrelated = normalGenerator;
