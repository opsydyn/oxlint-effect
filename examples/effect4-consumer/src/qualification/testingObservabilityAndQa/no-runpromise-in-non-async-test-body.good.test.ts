import { expect, it } from "bun:test";
import { Context, Effect } from "effect";
it("awaited", async () => { expect(await Effect.runPromise(Effect.succeed(42))).toBe(42); });
it("returned", () => { return Effect.runPromise(Effect.succeed(42)); });
it("implicit return", () => Effect.runPromise(Effect.succeed(42)));
// Retained direct-statement gaps: neither example is a test ownership repair.
it("nested discard", () => { if (true) { Effect.runPromise(Effect.succeed(42)); } });
const execute = Effect.runPromise;
it("aliased discard", () => { execute(Effect.succeed(42)); });
it("factory creation", () => { const run = Effect.runPromiseWith(Context.empty()); void run; });
it("returned context runner", () => Effect.runPromiseWith(Context.empty())(Effect.succeed(42)));
