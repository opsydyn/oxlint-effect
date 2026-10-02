import { PubSub, Queue } from "effect";
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const queue = Queue.unbounded<number>();
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const pubsub = PubSub.unbounded<number>();
