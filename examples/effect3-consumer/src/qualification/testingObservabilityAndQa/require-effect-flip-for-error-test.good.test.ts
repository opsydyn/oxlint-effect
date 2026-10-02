import { expect, it } from "bun:test";
import { Effect } from "effect";
import { original } from "./failure";
it("typed error value", async () => { const error = await Effect.runPromise(Effect.flip(Effect.fail(original))); expect(error).toBe(original); expect(error._tag).toBe("Q28Failure"); expect(error.requestId).toBe("q28"); });
it("ordinary rejection", async () => { await expect(Promise.reject(original)).rejects.toBe(original); });
// Stored runtime promises remain opaque to the direct assertion policy.
it("stored assertion", async () => { const promise = Effect.runPromise(Effect.fail(original)); await expect(promise).rejects.toBeDefined(); });
