import { Effect } from "effect";
// Parameter presence is checked; the platform operation must actually observe it.
export const direct = (operation: (signal: AbortSignal) => Promise<number>) => Effect.timeout(Effect.tryPromise({ try: signal => operation(signal), catch: error => error }), "1 second");
export const typed = <E>(operation: (signal: AbortSignal) => Promise<number>, error: E) => Effect.timeout(Effect.tryPromise({ try: signal => operation(signal), catch: () => error }), "1 second");
export const promise = (operation: (signal: AbortSignal) => Promise<number>) => Effect.timeout(Effect.promise(signal => operation(signal)), "1 second");
export const option = (operation: (signal: AbortSignal) => Promise<number>) => Effect.timeoutOption(Effect.tryPromise(signal => operation(signal)), "1 second");
export const fallback = (operation: (signal: AbortSignal) => Promise<number>) => Effect.timeoutOrElse(Effect.tryPromise(signal => operation(signal)), { duration: "1 second", orElse: () => Effect.succeed(42) });
export const curried = (operation: (signal: AbortSignal) => Promise<number>) => Effect.timeoutOption("1 second")(Effect.promise(signal => operation(signal)));
export const pipedOption = (operation: (signal: AbortSignal) => Promise<number>) => Effect.promise(signal => operation(signal)).pipe(Effect.timeoutOption("1 second"));
export const curriedTimeout = (operation: (signal: AbortSignal) => Promise<number>) => Effect.timeout("1 second")(Effect.promise(signal => operation(signal)));
export const pipedFallback = (operation: (signal: AbortSignal) => Promise<number>) => Effect.promise(signal => operation(signal)).pipe(Effect.timeoutOrElse({ duration: "1 second", orElse: () => Effect.succeed(42) }));
export const curriedFallback = (operation: (signal: AbortSignal) => Promise<number>) => Effect.timeoutOrElse({ duration: "1 second", orElse: () => Effect.succeed(42) })(Effect.promise(signal => operation(signal)));
// Known limit: a signal-shaped parameter may still be ignored by the operation.
export const ignored = (operation: () => Promise<number>) => Effect.timeout(Effect.promise(_signal => operation()), "1 second");
// Known limit: stored task bodies are not traced.
const stored = Effect.promise(() => Promise.resolve(42));
export const opaque = Effect.timeout(stored, "1 second");
