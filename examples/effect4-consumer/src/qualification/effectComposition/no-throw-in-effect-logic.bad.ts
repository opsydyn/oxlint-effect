import { Data, Effect, Filter } from "effect";
const pending = Effect.sync(() => "ready");
// EXPECT: linteffect/no-throw-in-effect-logic (current eager mapping with a pending source)
export const eagerMapping = Effect.mapEager(pending, () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic (current eager sequencing with a pending source)
export const eagerSequencing = pending.pipe(Effect.flatMapEager(() => { throw "invalid"; }));
class ValidationError extends Error {}
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const program = Effect.fail(new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-throw-in-effect-logic
export const generator = Effect.gen(function* () { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic (self-bound generator)
export const contextualGenerator = Effect.gen({ self: {} }, function* () { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const mapping = Effect.succeed("value").pipe(Effect.map(() => { throw "invalid"; }));
// EXPECT: linteffect/no-throw-in-effect-logic
export const recovery = Effect.catch(program, () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const catchEager = Effect.catchEager(program, () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const catchCause = Effect.catchCause(program, () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const catchDefect = Effect.catchDefect(Effect.die("defect"), () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const catchIf = Effect.catchIf(program, () => true, () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const catchFilter = Effect.catchFilter(program, Filter.fromPredicate((error: SourceError) => error.operation.length > 0), () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const catchCauseIf = Effect.catchCauseIf(program, () => true, () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const catchCauseFilter = Effect.catchCauseFilter(program, Filter.fromPredicate(() => true), () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const catchTag = Effect.catchTag(program, "SourceError", () => { throw "invalid"; });
// EXPECT: linteffect/no-throw-in-effect-logic
export const tagged = Effect.catchTags(program, { SourceError: () => { throw "invalid"; } });
class ReasonError extends Data.TaggedError("ReasonError")<{ readonly field: string }> {}
class ParentError extends Data.TaggedError("ParentError")<{ readonly reason: ReasonError }> {}
const reasonProgram = Effect.fail(new ParentError({ reason: new ReasonError({ field: "userId" }) }));
// EXPECT: linteffect/no-throw-in-effect-logic
export const reason = reasonProgram.pipe(Effect.catchReason("ParentError", "ReasonError", () => { throw "invalid"; }));
// EXPECT: linteffect/no-throw-in-effect-logic
export const reasons = reasonProgram.pipe(Effect.catchReasons("ParentError", { ReasonError: () => { throw "invalid"; } }));
