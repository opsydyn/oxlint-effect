import { Cause, Effect, Exit, Option } from "effect";
import { retained, original } from "./no-log-only-error-handling.good";
for (const program of [retained]) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Logging swallowed failure");
  const error = Cause.failureOption(exit.cause);
  if (!Option.isSome(error) || error.value !== original) throw new Error("Logging changed error identity");
}
console.log("Recovery and observer identity contracts passed");
