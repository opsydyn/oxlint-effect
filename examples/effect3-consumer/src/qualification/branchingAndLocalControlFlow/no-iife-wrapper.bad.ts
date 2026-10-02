import { Effect } from "effect";
// linteffect/no-iife-wrapper: direct arrow/FunctionExpression invocations.
export const arrow = (() => 42)();
export const regular = (function() { return 42; })();
export const asynchronous = (async () => 42)();
export const generator = (function*() { yield 42; })();
export const nested = (() => (() => 42)())();
export const task = (() => Effect.succeed(42))();
