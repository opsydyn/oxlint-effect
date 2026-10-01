import { Data, Effect, Option, Result } from "effect";
class StorageError extends Data.TaggedError("StorageError")<{ readonly cause: unknown }> {}
export const absent = Effect.succeed(Option.none<string>());
export const present = Effect.succeed(Option.some("user-1"));
export const expectedResult = Effect.succeed(Result.fail({ _tag: "Missing" as const, userId: "user-1" }));
export const operational = Effect.fail(new StorageError({ cause: new Error("storage offline") }));
export const unrelatedLiteral = Effect.fail("ConnectionFailed");
