import { Effect, pipe } from "effect";
// linteffect/no-effect-wrapper-alias: pipelines and concise factories.
export const receiver = Effect.succeed(1).pipe(Effect.map(n => n + 41));
export const free = pipe(Effect.succeed(1), Effect.map(n => n + 41));
export const concise = () => Effect.succeed(42);
export function returned() { return Effect.succeed(42); }
// Unused inner returns are searched by the outer declaration.
export function unused() { const never = () => { return Effect.succeed(0); }; return 42; }
export const left = () => Effect.succeed(42), right = () => Effect.succeed(42);
