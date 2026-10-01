import { Data, Effect } from "effect";
class ValidationError extends Error {}
class SourceError extends Data.TaggedError("SourceError")<{ readonly operation: string }> {}
const program = Effect.fail(new SourceError({ operation: "lookup" }));
// EXPECT: linteffect/no-promise-api-in-effect-logic
export const generator = Effect.gen(function* () { void Promise.resolve("value"); return Effect.fail(new SourceError({ operation: "lookup" })); });
// EXPECT: linteffect/no-promise-api-in-effect-logic
export const mapping = Effect.succeed("value").pipe(Effect.map(() => { void Promise.resolve("value"); return Effect.fail(new SourceError({ operation: "lookup" })); }));
// EXPECT: linteffect/no-promise-api-in-effect-logic
export const recovery = Effect.catchAll(program, () => { void Promise.resolve("value"); return Effect.fail(new SourceError({ operation: "lookup" })); });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 0)
export const promise0 = Effect.gen(function* () { void Promise.all([Promise.resolve("ready")]); return "ready"; });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 1)
export const promise1 = Effect.gen(function* () { void Promise.allSettled([Promise.resolve("ready")]); return "ready"; });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 2)
export const promise2 = Effect.gen(function* () { void Promise.any([Promise.resolve("ready")]); return "ready"; });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 3)
export const promise3 = Effect.gen(function* () { void Promise.race([Promise.resolve("ready")]); return "ready"; });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 4)
export const promise4 = Effect.gen(function* () { void Promise.resolve("ready"); return "ready"; });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 5)
export const promise5 = Effect.gen(function* () { void Promise.reject("ready"); return "ready"; });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 6)
export const promise6 = Effect.gen(function* () { void Promise.resolve("ready").then((value) => value); return "ready"; });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 7)
export const promise7 = Effect.gen(function* () { void Promise.resolve("ready").catch(() => "ready"); return "ready"; });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 8)
export const promise8 = Effect.gen(function* () { void Promise.resolve("ready").finally(() => {}); return "ready"; });
// EXPECT: linteffect/no-promise-api-in-effect-logic (Promise source 9)
export const promise9 = Effect.gen(function* () { void new Promise<string>((resolve) => resolve("ready")).then((value) => value); return "ready"; });
