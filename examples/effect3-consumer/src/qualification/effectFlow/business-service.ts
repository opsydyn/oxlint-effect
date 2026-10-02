import { Context, Effect, Layer } from "effect";
interface ReaderShape { readonly load: () => Effect.Effect<number> }
export class Reader extends Context.Tag("Q38Reader")<Reader, ReaderShape>() {}
export const live = Layer.succeed(Reader, { load: () => Effect.succeed(42) });
export const ReaderService = Reader;
