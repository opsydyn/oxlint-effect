import { Deferred, Effect, Semaphore } from "effect";
declare const semaphore: Semaphore.Semaphore;
Deferred.makeUnsafe<number>();
semaphore.withPermit(Effect.succeed(42));
Semaphore.withPermits(semaphore, 1)(Effect.succeed(42));
// @ts-expect-error Effect 4 replaced unsafeMake with makeUnsafe.
Deferred.unsafeMake<number>();
// @ts-expect-error Effect 4 constructs permits through the Semaphore module.
Effect.makeSemaphore(1);
// @ts-expect-error Effect 4 removed the legacy TSemaphore module.
import { TSemaphore } from "effect";
