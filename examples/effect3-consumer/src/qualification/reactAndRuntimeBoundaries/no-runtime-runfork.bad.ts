import { Effect, Runtime } from "effect";
// linteffect/no-runtime-runfork: data-first, curried and factory-only syntax.
export const direct = <E>(task: Effect.Effect<number, E>) => Runtime.runFork(Runtime.defaultRuntime, task);
export const curried = <E>(task: Effect.Effect<number, E>) => Runtime.runFork(Runtime.defaultRuntime)(task);
export const factory = Runtime.runFork(Runtime.defaultRuntime);
