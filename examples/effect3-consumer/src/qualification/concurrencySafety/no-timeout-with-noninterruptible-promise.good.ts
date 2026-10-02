import { Effect } from "effect";
// Parameter presence is checked; the platform operation must actually observe it.
export const direct = (operation: (signal: AbortSignal) => Promise<number>) => Effect.timeout(Effect.tryPromise({ try: signal => operation(signal), catch: error => error }), "1 second");
export const typed = <E>(operation: (signal: AbortSignal) => Promise<number>, error: E) => Effect.timeout(Effect.tryPromise({ try: signal => operation(signal), catch: () => error }), "1 second");

// Known limit: stored task bodies are not traced.
const stored = Effect.promise(() => Promise.resolve(42));
export const opaque = Effect.timeout(stored, "1 second");
