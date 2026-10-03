import { Effect } from "effect";
// CLEAN: synchronous map and Promise adaptation produce an Effect value.
export const mapped = Effect.succeed("ready").pipe(Effect.map((value) => value.toUpperCase()));
export const adapted = Effect.tryPromise({ try: () => Promise.resolve("ready"), catch: (cause) => ({ _tag: "PromiseError" as const, cause }) });
export const composed = adapted.pipe(Effect.flatMap((value) => Effect.succeed(value.toUpperCase())));
export const ordinary = async () => "ready";
// CLEAN: eager callbacks retain a pure mapper and explicit Effect-returning sequencing.
const pendingEagerRepair = Effect.sync(() => "ready");
export const eagerPureRepair = Effect.mapEager(pendingEagerRepair, value => value.toUpperCase());
export const eagerAsyncRepair = Effect.flatMapEager(pendingEagerRepair, value => Effect.tryPromise({ try: () => Promise.resolve(value.toUpperCase()), catch: cause => cause }));
