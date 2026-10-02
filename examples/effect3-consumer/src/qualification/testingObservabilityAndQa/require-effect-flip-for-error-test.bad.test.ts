import { expect, it, test, it as specify, it as bench } from "bun:test";
import { Effect } from "effect";
import { original } from "./failure";
// @lint-expect linteffect/require-effect-flip-for-error-test (five direct rejection assertions).
it("typed failure", async () => { await expect(Effect.runPromise(Effect.fail(original))).rejects.toBeDefined(); });
test("typed failure expression", async function() { await expect(Effect.runPromise(Effect.fail(original))).rejects.toBeDefined(); });
specify("typed failure alias", async () => { await expect(Effect.runPromise(Effect.fail(original))).rejects.toBeDefined(); });
bench("literal callback name", async () => { await expect(Effect.runPromise(Effect.fail(original))).rejects.toBeDefined(); });
// Legitimate rejection case: flip does not recover a defect. Retained syntax-only warning.
it("defect", async () => { await expect(Effect.runPromise(Effect.die(original))).rejects.toBeDefined(); });
