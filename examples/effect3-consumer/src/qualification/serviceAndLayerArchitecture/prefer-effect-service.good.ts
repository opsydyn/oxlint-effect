import { Effect } from "effect";
export class Built extends Effect.Service<Built>()("Built", { sync: () => ({ value: 42 }), accessors: true }) {}
