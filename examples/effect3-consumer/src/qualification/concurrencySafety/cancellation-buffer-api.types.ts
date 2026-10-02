import { Effect, Queue } from "effect";
// @ts-expect-error Legacy Queue.make needs backing queue and strategy, not options.
Queue.make<number>({ capacity: 1 });
// @ts-expect-error Legacy uses timeoutTo, not the v4 timeoutOrElse constructor.
Effect.timeoutOrElse(Effect.succeed(42), { duration: 1, orElse: () => Effect.succeed(0) });
