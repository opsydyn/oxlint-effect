import { Effect, Runtime } from "effect";

declare const SomeRuntime: Effect.Effect<string, never, never>;
declare const SomeRuntimeLive: never;
declare const runtime: Runtime.Runtime<never>;

export const program = Effect.gen(function* () {
  return yield* SomeRuntime.pipe(Effect.provide(SomeRuntimeLive));
});

export const unsafeRun = Effect.runPromise(program);

Runtime.runFork(runtime)(program);
