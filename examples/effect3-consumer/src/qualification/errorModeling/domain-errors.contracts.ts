import { Cause, Effect, Either, Exit, Option } from "effect";
import { absent, present, expectedResult } from "./no-expected-state-as-error.good";
import { generator, recovery, sourceError } from "./no-exception-domain-error.good";
import { failed as failure, source as emptyTagSource } from "./no-empty-error-tag.good";

if (!Option.isNone(await Effect.runPromise(absent))) throw new Error("Absence became a failure");
const value = await Effect.runPromise(present);
if (!Option.isSome(value) || value.value !== "user-1") throw new Error("Present value changed");
const state = await Effect.runPromise(expectedResult);
if (!Either.isLeft(state) || state.left.userId !== "user-1") throw new Error("Expected-state payload changed");
for (const [program, original] of [[generator, sourceError], [recovery, sourceError], [failure, emptyTagSource]] as const) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Domain error disappeared");
  const error = Cause.failureOption(exit.cause);
  if (!Option.isSome(error) || error.value._tag !== "ValidationError" || error.value.field !== "userId" || error.value.cause !== original) throw new Error("Domain payload or source cause changed");
}
console.log("Domain absence and error payload contracts passed");
