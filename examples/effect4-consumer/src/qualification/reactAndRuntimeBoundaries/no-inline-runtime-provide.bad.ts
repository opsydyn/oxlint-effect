import { Effect, Layer, pipe } from "effect";
import { SomeRuntime, live, program } from "./runtime-service";
// linteffect/no-inline-runtime-provide: every single-argument provide inside pipe.
export const member = program.pipe(Effect.provide(live));
export const free = pipe(program, Effect.provide(live));
export const inline = Effect.gen(function*() { return (yield* SomeRuntime.pipe(Effect.provide(live))).value; });
// Only the first provide in this pipe reports.
export const multiple = program.pipe(Effect.provide(live), Effect.provide(Layer.empty));
// Even valid empty/exported-boundary provision reports; no semantic ownership gate.
export const empty = Effect.succeed(42).pipe(Effect.provide(Layer.empty));
