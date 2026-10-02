import { it } from "bun:test";
const Effect = { runPromise: () => Promise.resolve(42) };
it("unrelated namespace", () => { Effect.runPromise(); });
