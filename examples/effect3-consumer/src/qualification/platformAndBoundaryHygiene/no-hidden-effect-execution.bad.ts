import { Effect, Exit } from "effect";
// Each exported runner intentionally fixes runtime ownership in reusable code.
// @lint-expect linteffect/no-hidden-effect-execution (six direct runners).
export const runPromise = () => Effect.runPromise(Effect.succeed(42));
export const runPromiseExit = () => Effect.runPromiseExit(Effect.succeed(42));
export const runSync = () => Effect.runSync(Effect.succeed(42));
export const runSyncExit = () => Effect.runSyncExit(Effect.succeed(42));
export const runFork = () => Effect.runFork(Effect.succeed(42));
export const runCallback = (onExit: (exit: Exit.Exit<number>) => void) => Effect.runCallback(Effect.succeed(42), { onExit });
