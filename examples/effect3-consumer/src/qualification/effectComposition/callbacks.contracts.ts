import { Cause, Effect, Exit, Option } from "effect";
import { mapped, composed } from "./no-async-effect-combinator-callback.good";
import { adapted, retained, original, tagged, mappedFailure, generatorFailure } from "./no-throw-in-effect-logic.good";
import { adapted as tryAdapted, original as tryOriginal } from "./no-try-catch-in-effect-logic.good";
for (const program of [mapped, composed]) if (await Effect.runPromise(program) !== "READY") throw new Error("Callback repair value changed");
for (const [program, cause] of [[adapted, original], [retained, original], [tryAdapted, tryOriginal]] as const) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Adapted error lost");
  const failure = Cause.failureOption(exit.cause);
  if (!Option.isSome(failure) || failure.value.field !== "userId" || failure.value.cause !== cause) throw new Error("Adapted error payload/cause changed");
}
const failed = Effect.fail(tagged);
if (await Effect.runPromise(Effect.map(Effect.sync(() => "ready"), () => failed)) !== failed) throw new Error("Mapping nested Effect counterexample changed");
if (await Effect.runPromise(Effect.gen(function* () { return failed; })) !== failed) throw new Error("Generator return counterexample changed");
for (const program of [mappedFailure, generatorFailure]) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Delegating repair did not fail");
  const failure = Cause.failureOption(exit.cause);
  if (!Option.isSome(failure) || failure.value !== tagged) throw new Error("Delegating repair lost tagged identity");
}
console.log("Effect callback repair contracts passed");
