import { Effect, Exit, Option } from "effect";
import { mapped, composed } from "./no-async-effect-combinator-callback.good";
import { adapted, retained, original } from "./no-throw-in-effect-logic.good";
import { adapted as tryAdapted, original as tryOriginal } from "./no-try-catch-in-effect-logic.good";
for (const program of [mapped, composed]) if (await Effect.runPromise(program) !== "READY") throw new Error("Callback repair value changed");
for (const [program, cause] of [[adapted, original], [retained, original], [tryAdapted, tryOriginal]] as const) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Adapted error lost");
  const failure = Exit.findErrorOption(exit);
  if (!Option.isSome(failure) || failure.value.field !== "userId" || failure.value.cause !== cause) throw new Error("Adapted error payload/cause changed");
}
console.log("Effect callback repair contracts passed");
