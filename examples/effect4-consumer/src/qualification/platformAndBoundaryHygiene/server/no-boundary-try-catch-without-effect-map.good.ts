import { Effect } from "effect";
import { original } from "./no-boundary-try-catch-without-effect-map.bad";
export const typed = Effect.try({ try: () => { throw original; }, catch: () => original });
export const recovered = () => {
  try { return Effect.catch(typed, error => Effect.succeed(error)); } catch { throw new Error("No eager execution"); }
};
export const mapped = () => {
  try { return Effect.mapError(typed, error => error); } catch { throw new Error("No eager execution"); }
};
export const tagged = () => {
  try { return Effect.catchTag(typed, "ReadFailure", error => Effect.succeed(error)); } catch { throw new Error("No eager execution"); }
};
export const promise = () => {
  try { return Effect.tryPromise({ try: () => Promise.reject(original), catch: () => original }); } catch { throw new Error("No eager execution"); }
};
export const run = () => {
  try { return Effect.runPromise(Effect.succeed(42)); } catch { return Promise.resolve(0); }
};
// Presence is not execution: an unused ordinary callback still suppresses this policy.
export function unusedMarker() {
  try { const neverCalled = () => Effect.mapError(typed, error => error); void neverCalled; throw original; } catch (error) { return error; }
}
