import { Effect } from "effect";
function calculate(n: number) { const next = n + 1; const result = next * 2; return result; }
export const ordinary = [1].map(calculate);
export const direct = Effect.map(Effect.succeed(1), calculate);
export const piped = Effect.succeed(1).pipe(Effect.map(calculate));
export const expression = Effect.map(Effect.succeed(1), calculate);
// Two statements and expression bodies are below threshold.
export const small = Effect.map(Effect.succeed(1), n => { const next = n + 1; return next * 2; });
export const concise = Effect.map(Effect.succeed(1), n => (n + 1) * 2);
