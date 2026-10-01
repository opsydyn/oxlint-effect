import { Effect } from "effect";
// linteffect/require-service-accessors: omitted and explicitly disabled options.
export class Missing extends Effect.Service<Missing>()("Missing", { sync: () => ({ value: 42 }) }) {}
export class Disabled extends Effect.Service<Disabled>()("Disabled", { sync: () => ({ value: 42 }), accessors: false }) {}
