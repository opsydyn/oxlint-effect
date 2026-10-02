import { PubSub, Queue } from "effect";
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const queue = Queue.unbounded<number>();
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const pubsub = PubSub.unbounded<number>();
// @lint-expect linteffect/no-unbounded-queue-or-pubsub: make defaults to Infinity.
export const defaultQueue = Queue.make<number>();
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const strategyOnly = Queue.make<number>({ strategy: "suspend" });
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const undefinedCapacity = Queue.make<number>({ capacity: undefined });
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const infinite = Queue.make<number>({ capacity: Infinity });
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const explicitUndefined = Queue.make<number>(undefined);
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const numericInfinity = Queue.make<number>({ capacity: Number.POSITIVE_INFINITY });
// @lint-expect linteffect/no-unbounded-queue-or-pubsub
export const atomic = () => PubSub.makeAtomicUnbounded<number>();
