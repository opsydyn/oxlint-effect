import { Context, Effect } from "effect";
import { PoolService } from "./pool-layer";
export function negativeContracts() {
  const program = Effect.gen(function* () { return yield* PoolService; });
  // @ts-expect-error A real unresolved service environment cannot be run without provision.
  Effect.runPromise(program);
  // @ts-expect-error Empty context cannot satisfy this required service.
  Effect.runPromiseWith(Context.empty())(program);
  // @ts-expect-error Current acquireUseRelease is data-first only.
  Effect.acquireUseRelease(() => Effect.succeed(42), () => Effect.void)(Effect.succeed(42));
}
