import { Cause, Effect, Exit, Option } from "effect";
import { named } from "./no-public-generic-effect-error.good";
import { program } from "./no-effect-type-alias.good";
if (await Effect.runPromise(program) !== "ready") throw new Error("Inferred value changed");
const exit = await Effect.runPromiseExit(named());
if (!Exit.isFailure(exit)) throw new Error("Domain failure disappeared");
const error = Cause.failureOption(exit.cause);
if (!Option.isSome(error) || error.value._tag !== "UserNotFound" || error.value.userId !== "user-1") throw new Error("Public error payload changed");
console.log("Public type surface contracts passed");
