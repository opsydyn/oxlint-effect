import { Effect } from "effect";
// CLEAN: standard Promise adapter for a Promise-based platform API.
export const adapter = Effect.tryPromise({ try: () => Promise.resolve("ready"), catch: (cause) => ({ _tag: "AdapterError" as const, cause }) });
