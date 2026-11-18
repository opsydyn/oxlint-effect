import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import type {} from "../skills/oxlint-effect/assets/cause-narrowing.types";
import * as bad from "../skills/oxlint-effect/assets/cause-narrowing.bad";
import * as good from "../skills/oxlint-effect/assets/cause-narrowing.good";

describe("cause narrowing agent corpus", () => {
  it("rejects erasure even when tag and operation assertions would pass", () => {
    const detail = { credential: "private fixture" };
    const original = new good.ProviderFailure({ code: 503, cause: detail });
    for (const [erasing, preserving] of [[bad.mapProfile, good.mapProfile], [bad.recoverProfile, good.recoverProfile]] as const) {
      const lost = Effect.runSync(Effect.flip(erasing(Effect.fail(original))));
      const kept = Effect.runSync(Effect.flip(preserving(Effect.fail(original))));
      expect(lost._tag).toBe(kept._tag);
      expect(lost.operation).toBe(kept.operation);
      expect(() => {
        if (lost.cause !== original) throw new Error("original cause lost");
      }).toThrow("original cause lost");
      expect(kept.cause).toBe(original);
      expect(kept.cause.cause).toBe(detail);
      expect(good.toPublicFailure(kept)).toEqual({ _tag: "ProfileBoundaryFailure", operation: "profile.load" });
      expect(JSON.stringify(good.toPublicFailure(kept))).not.toContain("private fixture");
      expect(Effect.runSync(preserving(Effect.succeed(42)))).toBe(42);
    }
  });
  it("executes capture once before narrowing and never on success", () => {
    const original = new good.ProviderFailure({ code: 503, cause: "raw" });
    const events: good.ProviderFailure[] = [];
    const capture = (error: good.ProviderFailure) => Effect.sync(() => { events.push(error); });
    Effect.runSync(Effect.flip(bad.captureAndMap(Effect.fail(original), capture)));
    expect(events).toEqual([]);
    const result = Effect.runSync(Effect.flip(good.captureAndMap(Effect.fail(original), capture)));
    expect(events).toEqual([original]);
    expect(result.cause).toBe(original);
    expect(Effect.runSync(good.captureAndMap(Effect.succeed(42), capture))).toBe(42);
    expect(events).toEqual([original]);
  });
  it("runs the complete packaged runtime oracle, including unknown causes and non-typed failures", async () => {
    await import("../skills/oxlint-effect/assets/cause-narrowing.contracts");
  });
});
