import { Effect } from "effect";
import { PoolService } from "./pool-layer";
export function negativeContracts() {
  const program = Effect.gen(function* () { return yield* PoolService; });
  // @ts-expect-error A real unresolved service environment cannot be run without provision.
  Effect.runPromise(program);
  // @ts-expect-error Current contextual runner is not a legacy API.
  Effect.runPromiseWith;
  // @ts-expect-error Legacy acquireRelease has no interruptible options.
  Effect.acquireRelease(Effect.succeed(42), () => Effect.void, { interruptible: true });
}
