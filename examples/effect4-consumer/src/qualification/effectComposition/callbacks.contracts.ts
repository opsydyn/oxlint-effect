import { Effect, Exit, Option } from "effect";
import { mapped, composed } from "./no-async-effect-combinator-callback.good";
import { adapted, retained, original, tagged, mappedFailure, generatorFailure, eagerFailure, eagerPure } from "./no-throw-in-effect-logic.good";
import { adapted as tryAdapted, original as tryOriginal } from "./no-try-catch-in-effect-logic.good";
for (const program of [mapped, composed]) if (await Effect.runPromise(program) !== "READY") throw new Error("Callback repair value changed");
for (const [program, cause] of [[adapted, original], [retained, original], [tryAdapted, tryOriginal]] as const) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Adapted error lost");
  const failure = Exit.findErrorOption(exit);
  if (!Option.isSome(failure) || failure.value.field !== "userId" || failure.value.cause !== cause) throw new Error("Adapted error payload/cause changed");
}
const failed = Effect.fail(tagged);
if (await Effect.runPromise(Effect.map(Effect.sync(() => "ready"), () => failed)) !== failed) throw new Error("Mapping nested Effect counterexample changed");
if (await Effect.runPromise(Effect.gen(function* () { return failed; })) !== failed) throw new Error("Generator return counterexample changed");
for (const program of [mappedFailure, generatorFailure, eagerFailure]) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Delegating repair did not fail");
  const failure = Exit.findErrorOption(exit);
  if (!Option.isSome(failure) || failure.value !== tagged) throw new Error("Delegating repair lost tagged identity");
}
if (await Effect.runPromise(eagerPure) !== "READY") throw new Error("Eager pure mapping repair changed");
let calls = 0;
const callCount = () => calls;
const pending = Effect.sync(() => { calls += 1; return "ready"; });
const eagerMapped = Effect.mapEager(pending, value => value.toUpperCase());
const eagerAdapted = Effect.flatMapEager(pending, value => Effect.tryPromise({ try: () => Promise.resolve(value.toUpperCase()), catch: () => tagged }));
if (callCount() !== 0) throw new Error("Pending eager source ran at construction");
if (await Effect.runPromise(eagerMapped) !== "READY" || await Effect.runPromise(eagerAdapted) !== "READY" || callCount() !== 2) throw new Error("Pending eager repair did not execute once per run");
// Eager callbacks can run outside the interpreter when the source is already resolved.
for (const operator of [Effect.mapEager, Effect.flatMapEager]) {
  try {
    operator(Effect.succeed("ready"), () => { throw tagged; });
    throw new Error("Resolved eager callback did not throw at construction");
  } catch (error) {
    if (error !== tagged) throw new Error("Resolved eager throw identity changed");
  }
}
console.log("Effect callback repair contracts passed");
