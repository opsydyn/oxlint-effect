import { Effect, PubSub, Queue } from "effect";
declare const subscription: PubSub.Subscription<number>;
// @ts-expect-error V4 subscriptions have their own PubSub.take API.
Queue.take(subscription);
// @ts-expect-error V4 replaced timeoutTo with timeoutOrElse.
Effect.timeoutTo(Effect.succeed(42), { duration: 1, onSuccess: () => 42, onTimeout: () => 0 });
