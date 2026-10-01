import { Effect } from "effect";
// The current import-gated heuristic also covers non-Effect callback arguments.
export const ordinary = [1].map(n => { const next = n + 1; const result = next * 2; return result; });
// linteffect/prefer-extracted-concept: each inline block has three statements.
export const direct = Effect.map(Effect.succeed(1), n => { const next = n + 1; const result = next * 2; return result; });
export const piped = Effect.succeed(1).pipe(Effect.map(n => { const next = n + 1; const result = next * 2; return result; }));
export const expression = Effect.map(Effect.succeed(1), function (n) { const next = n + 1; const result = next * 2; return result; });
