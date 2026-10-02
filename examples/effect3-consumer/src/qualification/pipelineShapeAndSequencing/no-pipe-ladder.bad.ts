import { Effect, pipe } from "effect";
// linteffect/no-pipe-ladder: nested free and receiver pipes.
export const free = pipe(Effect.succeed(1), Effect.flatMap(n => pipe(Effect.succeed(n), Effect.map(m => m + 41))));
export const receiver = Effect.succeed(1).pipe(Effect.flatMap(n => Effect.succeed(n).pipe(Effect.map(m => m + 41))));
// Depth three emits two reports.
export const depth = pipe(pipe(pipe(1, n => n + 39), n => n + 1), n => n + 1);
// Unused callback bodies are searched, even though the nested pipe never runs.
export const unused = pipe(1, n => { const never = () => pipe(n, m => m + 41); return n + 41; });
