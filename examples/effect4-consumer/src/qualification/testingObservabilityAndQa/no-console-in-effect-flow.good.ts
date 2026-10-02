import { Effect } from "effect";
export const observed = Effect.as(Effect.logWarning("raw", { requestId: "q28" }), 42);
// A named callback remains opaque; this is not observability repair.
const raw = () => { console.warn("raw"); return 42; };
export const opaque = Effect.sync(raw);
export const unused = () => console.warn("raw");
