import { Cause, Effect, Exit, Option } from "effect";
import { mapped, propagated, sourceError } from "./valid";
import { boundaryRecovery } from "./main";

const originalExit = await Effect.runPromiseExit(propagated);
if (!Exit.isFailure(originalExit)) throw new Error("Propagation lost the failure");
const original = Cause.failureOption(originalExit.cause);
if (!Option.isSome(original) || original.value !== sourceError) throw new Error("Propagation lost error identity");
const mappedExit = await Effect.runPromiseExit(mapped);
if (!Exit.isFailure(mappedExit)) throw new Error("Mapping lost the failure");
const mappedError = Cause.failureOption(mappedExit.cause);
if (!Option.isSome(mappedError) || mappedError.value.cause !== sourceError) throw new Error("Mapping lost the cause");
const fallbackExit = await Effect.runPromiseExit(boundaryRecovery);
if (!Exit.isSuccess(fallbackExit) || fallbackExit.value !== null) throw new Error("Boundary fallback changed");
console.log("Recovery runtime contracts passed");
