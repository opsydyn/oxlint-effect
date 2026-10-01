import { Effect } from "effect";
// CLEAN: synchronous map and Promise adaptation produce an Effect value.
export const mapped = Effect.succeed("ready").pipe(Effect.map((value) => value.toUpperCase()));
export const adapted = Effect.tryPromise({ try: () => Promise.resolve("ready"), catch: (cause) => ({ _tag: "PromiseError" as const, cause }) });
export const composed = adapted.pipe(Effect.flatMap((value) => Effect.succeed(value.toUpperCase())));
export const ordinary = async () => "ready";
