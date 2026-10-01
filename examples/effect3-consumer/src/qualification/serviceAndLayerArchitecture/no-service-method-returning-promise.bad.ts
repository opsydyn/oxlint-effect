import { Effect } from "effect";
import { original } from "./method-failure";
// linteffect/no-service-method-returning-promise: explicit annotation.
export class Annotated extends Effect.Service<Annotated>()("Q14Annotated", { effect: Effect.succeed({ load: (): Promise<number> => Promise.resolve(42) }) }) {}
// linteffect/no-service-method-returning-promise: visible Promise API.
export class Resolved extends Effect.Service<Resolved>()("Q14Resolved", { effect: Effect.succeed({ load: () => Promise.resolve(42) }) }) {}
// linteffect/no-service-method-returning-promise: typed source failure.
export class Rejected extends Effect.Service<Rejected>()("Q14Rejected", { effect: Effect.succeed({ load: () => Promise.reject(original) }) }) {}
