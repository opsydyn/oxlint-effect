import { Context, Effect, Layer } from "effect";
export class SomeRuntime extends Context.Service<SomeRuntime, { readonly value: number }>()("Q50Runtime") {}
export const live = Layer.succeed(SomeRuntime, { value: 42 });
export const program = Effect.gen(function*() { const runtime = yield* SomeRuntime; return runtime.value; });
