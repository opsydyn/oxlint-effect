import { PubSub, Queue } from "effect";
// Bounded suspend/backpressure preserves messages; dropping/sliding changes semantics.
export const queue = Queue.bounded<number>(1);
export const pubsub = PubSub.bounded<number>(1);
