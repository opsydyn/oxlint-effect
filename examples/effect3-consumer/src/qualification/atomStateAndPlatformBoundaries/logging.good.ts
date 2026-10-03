import { Effect } from "effect";
export const observed = Effect.gen(function* () { yield* Effect.log("q51"); return 42; });
// Known syntax gaps, not recommended logging repairs.
const output = console;
export const alias = Effect.sync(() => output.log("q51"));
export const computed = Effect.sync(() => console["log"]("q51"));
const named = () => console.log("q51");
export const namedCallback = Effect.sync(named);
