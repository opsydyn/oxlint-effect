import { Data, Effect } from "effect";
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const failed = Effect.fail(new SourceError({ operation: "lookup" }));
const program = Effect.succeed("ready");
// EXPECT: linteffect/no-async-effect-combinator-callback (map data-first)
export const mapping = Effect.map(program, async (value) => value.toUpperCase());
// EXPECT: linteffect/no-async-effect-combinator-callback (map piped)
export const pipedMapping = program.pipe(Effect.map(async (value) => value.toUpperCase()));
// EXPECT: linteffect/no-async-effect-combinator-callback (andThen)
export const variant0 = Effect.andThen(program, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchAll)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant1 = Effect.catchAll(failed, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (catchTag)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant2 = Effect.catchTag(failed, "SourceError", async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (filterOrFail)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant3 = Effect.filterOrFail(program, async () => { throw new Error("invalid"); }, () => new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-async-effect-combinator-callback (flatMap)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant4 = Effect.flatMap(program, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (forEach)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant5 = Effect.forEach(["ready"], async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (orElse)
// @ts-expect-error Promise callback is intentionally incompatible with this Effect callback contract.
export const variant6 = Effect.orElse(failed, async () => { throw new Error("invalid"); });
// EXPECT: linteffect/no-async-effect-combinator-callback (tap)
export const variant7 = Effect.tap(program, async () => { throw new Error("invalid"); });
