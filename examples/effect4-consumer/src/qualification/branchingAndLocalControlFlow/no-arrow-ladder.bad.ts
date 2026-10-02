import { Effect } from "effect";
// linteffect/no-arrow-ladder: nested arrow IIFEs, not arbitrary nested arrows.
export const simple = (() => (() => 42)())();
export const depth = (() => (() => (() => 42)())())();
// Broad search includes unused callbacks.
export const unused = (() => { const never = () => (() => 0)(); return 42; })();
// First nested candidate only for this outer IIFE.
export const siblings = (() => { const a = (() => 20)(); const b = (() => 22)(); return a + b; })();
export const task = (() => (() => Effect.succeed(42))())();
