import { Effect } from "effect";
// EXPECT: linteffect/no-effect-async (callback bridge)
export const bridge = Effect.async<string>((resume) => { queueMicrotask(() => resume(Effect.succeed("ready"))); });
// EXPECT: linteffect/no-effect-async (cleanup registration)
export const cancellable = Effect.async<string>((resume) => { const timer = setTimeout(() => resume(Effect.succeed("ready")), 1); return Effect.sync(() => clearTimeout(timer)); });
