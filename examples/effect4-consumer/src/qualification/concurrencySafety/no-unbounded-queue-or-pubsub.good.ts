import { PubSub, Queue } from "effect";
// Bounded suspend/backpressure preserves messages; dropping/sliding changes semantics.
export const queue = Queue.bounded<number>(1);
export const pubsub = PubSub.bounded<number>(1);
export const configured = Queue.make<number>({ capacity: 1, strategy: "suspend" });
const options = { capacity: 1 };
export const opaque = Queue.make<number>(options);
export const spread = Queue.make<number>({ ...options });
// A later spread can overwrite a visible Infinity; spread inputs stay opaque.
export const overwritten = (options: { capacity?: number }) => Queue.make<number>({ capacity: Infinity, ...options });
// Known limit: capacity expressions are not evaluated.
const capacity = () => Infinity;
export const unchecked = Queue.make<number>({ capacity: capacity() });
