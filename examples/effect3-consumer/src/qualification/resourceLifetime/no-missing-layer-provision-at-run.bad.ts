import { Effect } from "effect";
import { PoolLive } from "./pool-layer";

// A Service-shaped identifier is not type proof; these real Effects have no environment.
const LocalService = Effect.succeed(42);
// @lint-expect linteffect/no-missing-layer-provision-at-run: conservative naming policy.
export const runPromise = () => Effect.runPromise(Effect.gen(function* () { return yield* LocalService; }));
// @lint-expect linteffect/no-missing-layer-provision-at-run: conservative naming policy.
export const runPromiseExit = () => Effect.runPromiseExit(Effect.gen(function* () { return yield* LocalService; }));
// @lint-expect linteffect/no-missing-layer-provision-at-run: conservative naming policy.
export const runSync = () => Effect.runSync(Effect.gen(function* () { return yield* LocalService; }));
// @lint-expect linteffect/no-missing-layer-provision-at-run: conservative naming policy.
export const runSyncExit = () => Effect.runSyncExit(Effect.gen(function* () { return yield* LocalService; }));
// @lint-expect linteffect/no-missing-layer-provision-at-run: conservative naming policy.
export const runFork = () => Effect.runFork(Effect.gen(function* () { return yield* LocalService; }));
// @lint-expect linteffect/no-missing-layer-provision-at-run: conservative naming policy.
export const runCallback = () => Effect.runCallback(Effect.gen(function* () { return yield* LocalService; }), { onExit: () => {} });
const stored = Effect.gen(function* () { return yield* LocalService; });
// @lint-expect linteffect/no-missing-layer-provision-at-run
export const named = () => Effect.runPromise(stored);
// @lint-expect linteffect/no-missing-layer-provision-at-run: retained broad legacy unused-function warning.
export const unused = () => Effect.runPromise(Effect.gen(function* () {
  const later = () => Effect.gen(function* () { return yield* LocalService; });
  void later; return 42;
}));
export function shadowed() {
  const program = Effect.provide(Effect.gen(function* () { return yield* LocalService; }), PoolLive);
  void program;
  {
    const program = Effect.gen(function* () { return yield* LocalService; });
    // Retained legacy first-name initializer gap.
    return Effect.runPromise(program);
  }
}
