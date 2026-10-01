import { Data, Effect } from "effect";
class ValidationError extends Error {}
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const program = Effect.fail(new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-throw-in-effect-logic
export const generator = Effect.gen(function* () { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const mapping = Effect.succeed("value").pipe(Effect.map(() => { throw "invalid"; }));
// EXPECT: linteffect/no-throw-in-effect-logic
export const recovery = Effect.catchAll(program, () => { throw "invalid"; });
