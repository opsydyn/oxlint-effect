import { Context, Effect, Layer } from "effect";
export const Source = Context.GenericTag<{ readonly value: number }>("Q14Source");
export const Middle = Context.GenericTag<{ readonly value: number }>("Q14Middle");
export const Output = Context.GenericTag<{ readonly value: number }>("Q14Output");
export const source = Layer.succeed(Source, { value: 21 });
export const middle = Layer.effect(Middle, Effect.gen(function* () { return { value: (yield* Source).value * 2 }; }));
export const output = Layer.effect(Output, Effect.gen(function* () { return { value: (yield* Middle).value }; }));
export const read = Effect.gen(function* () { return (yield* Output).value; });
