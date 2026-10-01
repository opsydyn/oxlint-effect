import { Effect } from "effect";
export class Missing extends Effect.Service<Missing>()("Missing", { sync: () => ({ value: 42 }), accessors: true }) {}
export class Disabled extends Effect.Service<Disabled>()("Disabled", { sync: () => ({ value: 42 }), accessors: true }) {}
