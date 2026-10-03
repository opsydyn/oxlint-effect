import { Effect } from "effect";
// no-effect-sync-console: every recognised console member inside sync; five reports.
export const direct = Effect.sync(() => { console.log("q51"); return 42; });
export const warning = Effect.sync(() => { console.warn("q51"); return 42; });
export const regular = Effect.sync(function () { console.info("q51"); return 42; });
export const unused = Effect.sync(() => { const neverCalled = () => console.error("unused"); return 42; });
export const multiple = Effect.sync(() => { console.log("first"); console.warn("second"); return 42; });
