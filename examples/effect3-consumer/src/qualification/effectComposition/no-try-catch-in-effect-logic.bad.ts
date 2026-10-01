import { Data, Effect } from "effect";
class ValidationError extends Error {}
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const program = Effect.fail(new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const generator = Effect.gen(function* () { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const mapping = Effect.succeed("value").pipe(Effect.map(() => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); }));
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const recovery = Effect.catchAll(program, () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
