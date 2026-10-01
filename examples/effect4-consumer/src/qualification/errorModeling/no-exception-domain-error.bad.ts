import { Data, Effect, Filter } from "effect";
class ValidationError extends Error {}
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const program = Effect.fail(new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-exception-domain-error
export const generator = Effect.gen(function* () { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const mapping = Effect.succeed("value").pipe(Effect.map(() => { throw new ValidationError("bad"); }));
// EXPECT: linteffect/no-exception-domain-error
export const recovery = Effect.catch(program, () => { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const catchEager = Effect.catchEager(program, () => { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const catchCause = Effect.catchCause(program, () => { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const catchDefect = Effect.catchDefect(Effect.die("defect"), () => { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const catchIf = Effect.catchIf(program, () => true, () => { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const catchFilter = Effect.catchFilter(program, Filter.fromPredicate((error: SourceError) => error.operation.length > 0), () => { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const catchCauseIf = Effect.catchCauseIf(program, () => true, () => { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const catchCauseFilter = Effect.catchCauseFilter(program, Filter.fromPredicate(() => true), () => { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const catchTag = Effect.catchTag(program, "SourceError", () => { throw new ValidationError("bad"); });
// EXPECT: linteffect/no-exception-domain-error
export const tagged = Effect.catchTags(program, { SourceError: () => { throw new ValidationError("bad"); } });
class ReasonError extends Data.TaggedError("ReasonError")<{ readonly field: string }> {}
class ParentError extends Data.TaggedError("ParentError")<{ readonly reason: ReasonError }> {}
const reasonProgram = Effect.fail(new ParentError({ reason: new ReasonError({ field: "userId" }) }));
// EXPECT: linteffect/no-exception-domain-error
export const reason = reasonProgram.pipe(Effect.catchReason("ParentError", "ReasonError", () => { throw new ValidationError("bad"); }));
// EXPECT: linteffect/no-exception-domain-error
export const reasons = reasonProgram.pipe(Effect.catchReasons("ParentError", { ReasonError: () => { throw new ValidationError("bad"); } }));
