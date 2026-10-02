import { Effect } from "effect";
// linteffect/no-return-in-callback: regular inline functions, not arrows/generators.
export const mapped = [1].map(function(n) { return n + 41; });
export const branched = [true, false].map(function(enabled) { if (enabled) return 42; return 0; });
export const unused = [1].map(function(n) { const never = function() { return 0; }; return n + 41; });
export const task = Effect.map(Effect.succeed(1), function(n) { return n + 41; });
export const asynchronous = [1].map(async function(n) { return n + 41; });
