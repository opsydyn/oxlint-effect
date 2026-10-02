import { Effect, Exit, Scope, ExecutionStrategy } from "effect";
import type { Client } from "./support";
export function contracts(scope: Scope.Scope.Closeable, client: Client) {
  // @ts-expect-error Scope.addFinalizer takes an Effect, not a callback.
  Scope.addFinalizer(scope, () => Effect.sync(() => client.close()));
  // @ts-expect-error Scope.close requires an Exit.
  Scope.close(scope);
  // @ts-expect-error A scope acquisition is not a closeable scope value.
  Scope.close(Scope.make(), Exit.succeed(undefined));
  // @ts-expect-error Legacy acquireRelease has no options argument.
  Effect.acquireRelease(Effect.succeed(client), () => Effect.void, { interruptible: true });
  // @ts-expect-error Legacy strategy is an ExecutionStrategy value, not a string.
  Scope.make("sequential");
  return Scope.make(ExecutionStrategy.sequential);
}
