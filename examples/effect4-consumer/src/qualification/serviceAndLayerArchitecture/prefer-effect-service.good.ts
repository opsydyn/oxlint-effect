import { Context, Effect, Layer } from "effect";
export class Built extends Context.Service<Built>()("Built", { make: Effect.succeed({ value: 42 }) }) {}
export const BuiltLive = Layer.effect(Built, Built.make);
export const Key = Context.Service<{ readonly value: number }>("Key");
export const KeyLive = Layer.succeed(Key, { value: 42 });
export class ClassKey extends Context.Service<ClassKey, { readonly value: number }>()("ClassKey") {}
export const ClassKeyLive = Layer.succeed(ClassKey, { value: 42 });
