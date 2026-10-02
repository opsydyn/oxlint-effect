import { expect, it } from "bun:test";
import { Effect } from "effect";
it("awaited", async () => { expect(await Effect.runPromise(Effect.succeed(42))).toBe(42); });
it("returned", () => { return Effect.runPromise(Effect.succeed(42)); });
it("implicit return", () => Effect.runPromise(Effect.succeed(42)));
// Retained direct-statement gaps: neither example is a test ownership repair.
it("nested discard", () => { if (true) { Effect.runPromise(Effect.succeed(42)); } });
const execute = Effect.runPromise;
it("aliased discard", () => { execute(Effect.succeed(42)); });
