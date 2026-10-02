import { expect, it } from "bun:test";
import { Effect, Layer } from "effect";
import { Repo, Store, program } from "./test-service";
// @lint-expect linteffect/no-test-mock-layer-when-default-available: valid dependency replacement still warns under strict style policy.
export const succeed = Layer.provide(Store.Default, Layer.succeed(Repo, { load: () => Effect.succeed(42) }));
// @lint-expect linteffect/no-test-mock-layer-when-default-available
export const effect = Layer.provide(Store.Default, Layer.effect(Repo, Effect.succeed({ load: () => Effect.succeed(42) })));
// @lint-expect linteffect/no-test-mock-layer-when-default-available: arbitrary Default property is a retained naming false positive.
const policy = { Default: Layer.empty };
export const unrelated = Layer.provide(policy.Default, Layer.succeed(Repo, { load: () => Effect.succeed(42) }));
it("explicit dependency mock", async () => { expect(await Effect.runPromise(Effect.provide(program, succeed))).toBe(42); });
