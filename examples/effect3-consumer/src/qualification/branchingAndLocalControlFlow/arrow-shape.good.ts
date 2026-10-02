import { Effect } from "effect";
// Single arrow, nested ordinary arrow, and mixed function IIFEs are not arrow ladders.
export const single = (() => 42)();
export const nestedArrow = (() => { const next = () => 42; return next(); })();
export const functionInner = (() => (function() { return 42; })())();
export const functionOuter = (function() { return (() => 42)(); })();
export const task = Effect.succeed(42);
