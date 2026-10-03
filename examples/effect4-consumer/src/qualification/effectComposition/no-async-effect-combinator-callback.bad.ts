import { Data, Effect, Filter } from "effect";
const pending = Effect.sync(() => "ready");
// EXPECT: linteffect/no-async-effect-combinator-callback (current eager mapping)
export const eagerMapping = Effect.mapEager(pending, async value => value.toUpperCase());
// EXPECT: linteffect/no-async-effect-combinator-callback (current eager sequencing)
// @ts-expect-error Promise callback is intentionally not an Effect-returning callback.
export const eagerSequencing = pending.pipe(Effect.flatMapEager(async value => value.toUpperCase()));
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const failed = Effect.fail(new SourceError({ operation: "lookup" }));
const program = Effect.succeed("ready");
// EXPECT: linteffect/no-async-effect-combinator-callback (map data-first)
export const mapping = Effect.map(program, async (value) => value.toUpperCase());
// EXPECT: linteffect/no-async-effect-combinator-callback (map piped)
export const pipedMapping = program.pipe(Effect.map(async (value) => value.toUpperCase()));
// EXPECT: linteffect/no-async-effect-combinator-callback (andThen)
// @ts-expect-error V4 andThen requires an Effect callback, unlike the legacy Promise adaptation overload.
export const variant0 = Effect.andThen(program, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catch)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant1 = Effect.catch(failed, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchEager)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant2 = Effect.catchEager(failed, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchCause)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant3 = Effect.catchCause(failed, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchDefect)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant4 = Effect.catchDefect(failed, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchIf)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant5 = Effect.catchIf(failed, () => true, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchFilter)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant6 = Effect.catchFilter(failed, Filter.fromPredicate((error: SourceError) => error.operation.length > 0), async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchCauseIf)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant7 = Effect.catchCauseIf(failed, () => true, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchCauseFilter)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant8 = Effect.catchCauseFilter(failed, Filter.fromPredicate(() => true), async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchTag)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant9 = Effect.catchTag(failed, "SourceError", async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchTags)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant10 = Effect.catchTags(failed, { SourceError: async () => { throw new Error("invalid"); } });
class ReasonError extends Data.TaggedError("ReasonError")<{ readonly field: string }> {}
class ParentError extends Data.TaggedError("ParentError")<{ readonly reason: ReasonError }> {}
const reasonProgram = Effect.fail(new ParentError({ reason: new ReasonError({ field: "userId" }) }));
// EXPECT: linteffect/no-async-effect-combinator-callback (catchReason)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant11 = reasonProgram.pipe(Effect.catchReason("ParentError", "ReasonError", async () => { throw new Error("invalid"); }));
// EXPECT: linteffect/no-async-effect-combinator-callback (catchReasons)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant12 = reasonProgram.pipe(Effect.catchReasons("ParentError", { ReasonError: async () => { throw new Error("invalid"); } }));
// EXPECT: linteffect/no-async-effect-combinator-callback (filterOrFail)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant13 = Effect.filterOrFail(program, async () => { throw new Error("invalid"); }, () => new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-async-effect-combinator-callback (flatMap)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant14 = Effect.flatMap(program, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (forEach)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant15 = Effect.forEach(["ready"], async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (tap)
// @ts-expect-error V4 tap requires an Effect callback, unlike the legacy Promise adaptation overload.
export const variant16 = Effect.tap(program, async () => { throw new Error("invalid"); });
