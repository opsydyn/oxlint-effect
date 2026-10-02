import { Effect, pipe } from "effect";
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const direct = (operation: () => Promise<number>) => Effect.timeout(Effect.promise(() => operation()), "1 second");
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const tryFunction = (operation: () => Promise<number>) => Effect.timeout(Effect.tryPromise(() => operation()), "1 second");
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const tryObject = (operation: () => Promise<number>) => Effect.timeout(Effect.tryPromise({ try: () => operation(), catch: error => error }), "1 second");
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const option = (operation: () => Promise<number>) => Effect.timeoutOption(Effect.promise(() => operation()), "1 second");
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const piped = (operation: () => Promise<number>) => Effect.promise(() => operation()).pipe(Effect.timeout("1 second"));
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const curried = (operation: () => Promise<number>) => Effect.timeoutOption("1 second")(Effect.tryPromise(() => operation()));
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const fallback = (operation: () => Promise<number>) => Effect.timeoutOrElse(Effect.promise(() => operation()), { duration: "1 second", orElse: () => Effect.succeed(42) });
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const functional = (operation: () => Promise<number>) => pipe(Effect.promise(() => operation()), Effect.timeout("1 second"));
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const pipedOption = (operation: () => Promise<number>) => Effect.promise(() => operation()).pipe(Effect.timeoutOption("1 second"));
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const curriedTimeout = (operation: () => Promise<number>) => Effect.timeout("1 second")(Effect.promise(() => operation()));
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const pipedFallback = (operation: () => Promise<number>) => Effect.promise(() => operation()).pipe(Effect.timeoutOrElse({ duration: "1 second", orElse: () => Effect.succeed(42) }));
// @lint-expect linteffect/no-timeout-with-noninterruptible-promise
export const curriedFallback = (operation: () => Promise<number>) => Effect.timeoutOrElse({ duration: "1 second", orElse: () => Effect.succeed(42) })(Effect.promise(() => operation()));
