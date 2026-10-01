import { Effect } from "effect";

// CLEAN under the selected boundary policy; warns when that policy is replaced.
export const boundaryRecovery = Effect.catch(Effect.fail(new Error("source")), () => Effect.succeed(null));
export function executeAtBoundary() { return Effect.runSync(Effect.succeed("ok")); }
