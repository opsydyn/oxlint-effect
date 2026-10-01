import { Cause, Effect, Exit, Option } from "effect";
import { retained, original } from "./no-effect-ignore.good";
import { program, events } from "./no-effect-never.good";
const exit = await Effect.runPromiseExit(retained);
if (!Exit.isFailure(exit)) throw new Error("Failure swallowed");
const error = Cause.failureOption(exit.cause);
if (!Option.isSome(error) || error.value !== original) throw new Error("Failure identity changed");
if (await Effect.runPromise(program) !== "resource" || events.join(",") !== "acquire,release") throw new Error("Resource not released exactly once");
console.log("Failure ownership and finite lifecycle contracts passed");
