import { Context, Effect, Layer } from "effect";
export class SomeRuntime extends Context.Tag("Q50Runtime")<SomeRuntime, { readonly value: number }>() {}
export const live = Layer.succeed(SomeRuntime, { value: 42 });
export const program = Effect.gen(function*() { const runtime = yield* SomeRuntime; return runtime.value; });
