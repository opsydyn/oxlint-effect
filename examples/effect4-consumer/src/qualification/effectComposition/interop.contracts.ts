import { Effect, Exit, Option } from "effect";
import { composed, bounded, typed, unrelated, unused } from "./no-promise-api-in-effect-logic.good";
import { retained, original, tagged, voidRetained, causeRetained } from "./no-swallowed-catch-all.good";
import { program } from "./no-manual-effect-channels.good";
for (const task of [composed, program, typed, unrelated, unused]) if (await Effect.runPromise(task) !== "ready") throw new Error("Interop result changed");
if ((await Effect.runPromise(bounded)).join(",") !== "ready,ready") throw new Error("Result order changed");
if (await Effect.runPromise(tagged) !== "read") throw new Error("Tagged payload lost");
for (const task of [retained, voidRetained, causeRetained]) {
 const exit = await Effect.runPromiseExit(task);
 if (!Exit.isFailure(exit)) throw new Error("Failure swallowed");
 const error = Exit.findErrorOption(exit);
 if (!Option.isSome(error) || error.value !== original) throw new Error("Failure identity changed");
}
console.log("Promise interop and channel contracts passed");
