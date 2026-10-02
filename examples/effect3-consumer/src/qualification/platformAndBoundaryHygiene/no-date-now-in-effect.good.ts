import { Clock, Effect } from "effect";
export const time = Clock.currentTimeMillis;
export const fn = Effect.fn(function* () { return yield* Clock.currentTimeMillis; });
// Opaque callbacks and aliases are retained gaps, not deterministic clock repairs.
const readTime = () => Date.now();
export const opaque = Effect.sync(readTime);
const now = Date.now;
export const alias = Effect.sync(() => now());
// Plain wall-clock code outside an Effect construction is not in this rule's scope.
export const boundaryInput = () => Date.now();
