import { Effect } from "effect";
// linteffect/no-clever-effect-expression: inline wrapper mixes two pillars even below depth four.
export const wrapped = (() => Effect.gen(function* () { return 1; }).pipe(Effect.withSpan("wrapped")))();
// linteffect/no-clever-effect-expression: depth four combines workflow with decoration.
export const nested = Effect.catchAll(Effect.gen(function* () { return String(Math.abs(-1)); }), () => Effect.succeed("1"));
// linteffect/no-clever-effect-expression: the same threshold in piped form.
export const piped = Effect.gen(function* () { return String(Math.abs(-1)); }).pipe(Effect.catchAll(() => Effect.succeed("1")));
