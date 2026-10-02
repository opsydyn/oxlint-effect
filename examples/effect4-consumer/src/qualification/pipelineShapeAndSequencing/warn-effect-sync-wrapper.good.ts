import { Effect } from "effect";
export function deferred(events: string[]) {
  return Effect.sync(() => { events.push("touch"); return 42; });
}
export const pure = Effect.succeed(42);
export const literal = Effect.sync(() => 42);
// Named and FunctionExpression callbacks are opaque; these retain laziness.
const callback = () => 42;
export const named = Effect.sync(callback);
export const expression = Effect.sync(function() { return 42; });
// Console is excluded here and handled by other console-specific rules.
export const consoleExcluded = Effect.sync(() => console.info("Q43 console control"));
export function defect(error: object) { return Effect.sync(() => { throw error; }); }
