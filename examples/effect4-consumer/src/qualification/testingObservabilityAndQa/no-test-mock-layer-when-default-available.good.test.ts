import { expect, it } from "bun:test";
import { Effect, Layer } from "effect";
import { Repo, RepoLive, Store, program } from "./test-service";
export const defaults = Layer.provide(Store.Default, RepoLive);
export const dedicated = Layer.succeed(Store, { load: () => Effect.succeed(42) });
// Moving a mock into a variable changes syntax, not which contract the test exercises.
const mock = Layer.succeed(Repo, { load: () => Effect.succeed(42) });
export const alias = Layer.provide(Store.Default, mock);
it("default wiring", async () => { expect(await Effect.runPromise(Effect.provide(program, defaults))).toBe(42); });
it("dedicated test service", async () => { expect(await Effect.runPromise(Effect.provide(program, dedicated))).toBe(42); });
