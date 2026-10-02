import { Effect } from "effect";
import { original } from "./failure";
export const structured = Effect.catchAll(Effect.fail(original), error => Effect.as(Effect.logError("failed", error), 42));
export const annotated = Effect.tapError(Effect.fail(original), error => Effect.logError("failed").pipe(Effect.annotateLogs({ requestId: error.requestId })));
// Empty objects satisfy syntax but add no useful correlation.
export const empty = Effect.catchAll(Effect.fail(original), () => Effect.as(Effect.logError("failed", {}), 42));
// Unexecuted annotation elsewhere in this handler suppresses the retained marker policy.
export const markerOnly = Effect.catchAll(Effect.fail(original), () => {
  const neverUsed = Effect.annotateLogs(Effect.logError("unused"), { requestId: "q28" }); void neverUsed;
  return Effect.as(Effect.logError("failed"), 42);
});
// Top-level log calls are outside the error-handler/service policy.
export const unrelated = Effect.logError("top-level");
