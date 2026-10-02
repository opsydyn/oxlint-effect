import { Deferred, Effect, FiberId } from "effect";
declare const semaphore: Effect.Semaphore;
Deferred.unsafeMake<number>(FiberId.none);
semaphore.withPermits(1)(Effect.succeed(42));
// @ts-expect-error Legacy Deferred uses unsafeMake with a FiberId.
Deferred.makeUnsafe<number>();
// @ts-expect-error Legacy Effect.Semaphore has withPermits, not withPermit.
semaphore.withPermit(Effect.succeed(42));
// @ts-expect-error The standalone Semaphore module belongs to Effect 4.
import { Semaphore } from "effect";
