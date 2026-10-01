import { Effect } from "effect";
// TYPE CONTRACT: Effect.async was removed; its rule remains legacy-only.
// @ts-expect-error Effect 4 exposes callback instead of async.
type RemovedAsync = typeof Effect.async;
export const callback = Effect.callback<string>((resume) => { queueMicrotask(() => resume(Effect.succeed("ready"))); });
export type LegacyAsyncMissing = RemovedAsync;
