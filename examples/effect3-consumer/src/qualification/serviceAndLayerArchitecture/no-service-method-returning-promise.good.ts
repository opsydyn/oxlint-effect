import { Effect } from "effect";
import { original } from "./method-failure";
export class Annotated extends Effect.Service<Annotated>()("Q14Annotated", { effect: Effect.succeed({ load: () => Effect.succeed(42) }) }) {}
export class Resolved extends Effect.Service<Resolved>()("Q14Resolved", { effect: Effect.succeed({ load: () => Effect.sync(() => 42) }) }) {}
export class Rejected extends Effect.Service<Rejected>()("Q14Rejected", { effect: Effect.succeed({ load: () => Effect.fail(original) }) }) {}
