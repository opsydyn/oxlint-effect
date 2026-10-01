import { Data, Effect } from "effect";
class ValidationError extends Error {}
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const program = Effect.fail(new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-exception-domain-error
export const generator = Effect.gen(function* () { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const mapping = Effect.succeed("value").pipe(Effect.map(() => { throw new ValidationError("bad"); }));
// EXPECT: linteffect/no-exception-domain-error
export const recovery = Effect.catchAll(program, () => { throw new ValidationError("bad"); });
