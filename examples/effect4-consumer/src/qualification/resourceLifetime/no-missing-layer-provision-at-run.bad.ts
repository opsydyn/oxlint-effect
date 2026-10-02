import { Context, Effect } from "effect";
import { PoolLive, PoolService } from "./pool-layer";
import type { DatabasePool } from "./pool-support";
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
// Current policy skips the unused ordinary function; legacy policy still warns.
export const unused = () => Effect.runPromise(Effect.gen(function* () {
  const later = () => Effect.gen(function* () { return yield* LocalService; });
  void later; return 42;
}));
export function shadowed() {
  const program = Effect.provide(Effect.gen(function* () { return yield* LocalService; }), PoolLive);
  void program;
  {
    const program = Effect.gen(function* () { return yield* LocalService; });
    // @lint-expect linteffect/no-missing-layer-provision-at-run: resolve the active binding, not the earlier namesake.
    return Effect.runPromise(program);
  }
}
// @lint-expect linteffect/no-missing-layer-provision-at-run: even a valid Context is not visible Layer provision.
export const runPromiseWith = (context: Context.Context<DatabasePool>) => Effect.runPromiseWith(context)(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }));
// @lint-expect linteffect/no-missing-layer-provision-at-run: even a valid Context is not visible Layer provision.
export const runPromiseExitWith = (context: Context.Context<DatabasePool>) => Effect.runPromiseExitWith(context)(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }));
// @lint-expect linteffect/no-missing-layer-provision-at-run: even a valid Context is not visible Layer provision.
export const runSyncWith = (context: Context.Context<DatabasePool>) => Effect.runSyncWith(context)(Effect.gen(function* () { const client = yield* PoolService; return client.read(); }));
