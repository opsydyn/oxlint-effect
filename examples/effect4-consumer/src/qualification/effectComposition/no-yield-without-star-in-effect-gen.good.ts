import { Effect } from "effect";
// CLEAN: delegation infers the resumed value.
export const delegated = Effect.gen(function* () { const value = yield* Effect.succeed("ready"); return value; });
const normalGenerator = function* () { yield "ordinary"; };
export const unrelated = normalGenerator;
export const contextual = Effect.gen({ self: { value: "ready" } }, function* () { return yield* Effect.succeed(this.value); });
// CLEAN: plain yield inside a separately defined JS generator is not outer Effect logic.
export const nestedFunction = Effect.gen(function* () { const unused = function* () { yield "unused"; }; void unused; return "ready"; });
