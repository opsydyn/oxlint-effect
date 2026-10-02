import { Effect, Exit, Layer, Scope } from "effect";
import type { Client } from "./support";
export function contracts(scope: Scope.Closeable, client: Client) {
  // @ts-expect-error Scope.addFinalizer takes an Effect, not a callback.
  Scope.addFinalizer(scope, () => Effect.sync(() => client.close()));
  // @ts-expect-error Scope.close requires an Exit.
  Scope.close(scope);
  // @ts-expect-error A scope acquisition is not a closeable scope value.
  Scope.close(Scope.make(), Exit.succeed(undefined));
  // @ts-expect-error Removed legacy acquisition API.
  Effect.acquireReleaseInterruptible(Effect.succeed(client), () => Effect.void);
  // @ts-expect-error Removed legacy Layer.scoped API.
  Layer.scoped(Effect.void);
  // @ts-expect-error Current acquireUseRelease is data-first only.
  Effect.acquireUseRelease((client: Client) => Effect.succeed(client.value), () => Effect.void)(Effect.succeed(client));
  // @ts-expect-error Current scope strategy uses literals, not legacy objects.
  Scope.make({ _tag: "Sequential" });
  return Scope.make("sequential");
}
