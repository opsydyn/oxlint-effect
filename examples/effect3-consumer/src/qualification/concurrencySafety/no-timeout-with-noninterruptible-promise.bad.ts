import { Effect, pipe } from "effect";
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const direct = (operation: () => Promise<number>) => Effect.timeout(Effect.promise(() => operation()), "1 second");
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const tryFunction = (operation: () => Promise<number>) => Effect.timeout(Effect.tryPromise(() => operation()), "1 second");
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const tryObject = (operation: () => Promise<number>) => Effect.timeout(Effect.tryPromise({ try: () => operation(), catch: error => error }), "1 second");
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise: retained legacy policy.
// Legacy promise also accepts signals, but this existing rule always flags it.
export const legacySignal = (operation: (signal: AbortSignal) => Promise<number>) => Effect.timeout(Effect.promise(signal => operation(signal)), "1 second");
