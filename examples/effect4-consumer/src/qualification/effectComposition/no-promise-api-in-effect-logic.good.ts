import { Effect } from "effect";
// CLEAN: adaptation is outside the generator.
const adapter = Effect.tryPromise({ try: () => Promise.resolve("ready"), catch: (cause) => ({ _tag: "AdapterError" as const, cause }) });
export const composed = Effect.gen(function* () { return yield* adapter; });
export const bounded = Effect.all([Effect.succeed("ready"), Effect.succeed("ready")], { concurrency: 2 });
// CLEAN: typed Effect recovery and unrelated receivers are not Promise chains.
export const typed = Effect.gen(function* () { return yield* Effect.catch(Effect.fail("source"), () => Effect.succeed("ready")); });
const Other = { catch: (value: string) => value };
export const unrelated = Effect.gen(function* () { return Other.catch("ready"); });
export const unused = Effect.gen(function* () { const unused = () => Promise.resolve("unused"); void unused; return "ready"; });
