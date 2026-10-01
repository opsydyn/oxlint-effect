import { Effect } from "effect";
// CLEAN: adaptation is outside the generator.
const adapter = Effect.tryPromise({ try: () => Promise.resolve("ready"), catch: (cause) => ({ _tag: "AdapterError" as const, cause }) });
export const composed = Effect.gen(function* () { return yield* adapter; });
export const bounded = Effect.all([Effect.succeed("ready"), Effect.succeed("ready")], { concurrency: 2 });
