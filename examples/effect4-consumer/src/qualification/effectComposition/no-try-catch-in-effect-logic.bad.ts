import { Data, Effect, Filter } from "effect";
class ValidationError extends Error {}
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const program = Effect.fail(new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const generator = Effect.gen(function* () { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic (self-bound generator)
export const contextualGenerator = Effect.gen({ self: {} }, function* () { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const mapping = Effect.succeed("value").pipe(Effect.map(() => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); }));
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const recovery = Effect.catch(program, () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const catchEager = Effect.catchEager(program, () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const catchCause = Effect.catchCause(program, () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const catchDefect = Effect.catchDefect(Effect.die("defect"), () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const catchIf = Effect.catchIf(program, () => true, () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const catchFilter = Effect.catchFilter(program, Filter.fromPredicate((error: SourceError) => error.operation.length > 0), () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const catchCauseIf = Effect.catchCauseIf(program, () => true, () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const catchCauseFilter = Effect.catchCauseFilter(program, Filter.fromPredicate(() => true), () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const catchTag = Effect.catchTag(program, "SourceError", () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); });
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const tagged = Effect.catchTags(program, { SourceError: () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); } });
class ReasonError extends Data.TaggedError("ReasonError")<{ readonly field: string }> {}
class ParentError extends Data.TaggedError("ParentError")<{ readonly reason: ReasonError }> {}
const reasonProgram = Effect.fail(new ParentError({ reason: new ReasonError({ field: "userId" }) }));
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const reason = reasonProgram.pipe(Effect.catchReason("ParentError", "ReasonError", () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); }));
// EXPECT: linteffect/no-try-catch-in-effect-logic
export const reasons = reasonProgram.pipe(Effect.catchReasons("ParentError", { ReasonError: () => { try { JSON.parse("invalid"); } catch (cause) { throw cause; } throw new Error("unreachable"); } }));
