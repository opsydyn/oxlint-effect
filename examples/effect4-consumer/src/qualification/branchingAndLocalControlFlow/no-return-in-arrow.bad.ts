import { Effect } from "effect";
// linteffect/no-return-in-arrow: direct inline block-arrow arguments.
export const mapped = [1].map(n => { return n + 41; });
export const branched = [true, false].map(enabled => { if (enabled) return 42; return 0; });
// Broad return search includes unused nested callback returns.
export const unused = [1].map(n => { const never = () => { return 0; }; return n + 41; });
export const task = Effect.map(Effect.succeed(1), n => { return n + 41; });
function apply(a: (n: number) => number, b: (n: number) => number) { return a(1) + b(1); }
export const multiple = apply(n => { return n + 19; }, n => { return n + 21; });
