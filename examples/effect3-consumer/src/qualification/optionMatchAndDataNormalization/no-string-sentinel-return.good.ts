import { Data, Effect, Option, Either } from "effect";
export const present = Effect.succeed(Option.some(42));
export const absent = Effect.succeed(Option.none<number>());
export const state = Effect.succeed({ _tag: "Ready" as const, value: 42 });
export const accepted = Effect.succeed(Either.right(42));
export class Denied extends Data.TaggedError("Q36Denied")<{ readonly requestId: string }> {}
export const failure = new Denied({ requestId: "q36" });
export const rejected = Effect.succeed(Either.left(failure));
// Clean aliases/templates can still return the same string sentinel.
const token = "ready";
export const stored = Effect.succeed(token);
export const template = Effect.succeed(`ready`);
