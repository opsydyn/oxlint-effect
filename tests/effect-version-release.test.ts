import { describe, expect, it } from "bun:test";
import plugin from "../src/index";
import { assertEffectVersionReleaseReady } from "../scripts/effect-version-release";

const qualified = { applicability: { "3": true, "4": true }, qualification: { "3": "qualified", "4": "qualified" } };

describe("Effect version release gate", () => {
  it("requires qualification of every applicable major, not just a packed probe", () => {
    for (const major of [3, 4]) {
      for (const state of ["pending", "baseline"]) {
        const row = { ...qualified, qualification: { ...qualified.qualification, [major]: state } };
        expect(() => assertEffectVersionReleaseReady(["a"], { a: row }, "2.0.0")).toThrow("not qualified");
      }
    }
    expect(() => assertEffectVersionReleaseReady(["a"], { a: qualified }, "2.0.0")).not.toThrow();
  });
  it("rejects missing inventory entries and malformed applicability", () => {
    expect(() => assertEffectVersionReleaseReady(["a", "new-rule"], { a: qualified }, "2.0.0")).toThrow("inventory");
    expect(() => assertEffectVersionReleaseReady(["a"], { a: qualified, extra: qualified }, "2.0.0")).toThrow("inventory");
    expect(() => assertEffectVersionReleaseReady(["a"], { a: {} }, "2.0.0")).toThrow("not qualified");
    expect(() => assertEffectVersionReleaseReady(["a"], { a: { applicability: { "3": "true" }, qualification: {} } }, "2.0.0")).toThrow("not qualified");
  });
  it("permits qualified legacy-only rules without fictional v4 qualification", () => {
    const legacy = { applicability: { "3": true, "4": false }, qualification: { "3": "qualified", "4": "not-applicable" } };
    expect(() => assertEffectVersionReleaseReady(["legacy"], { legacy }, "2.0.0")).not.toThrow();
    expect(() => assertEffectVersionReleaseReady(["legacy"], { legacy: { ...legacy, qualification: { "3": "qualified", "4": "pending" } } }, "2.0.0")).toThrow("not qualified");
  });
  it("blocks a breaking default-policy publication under the old version", () => {
    expect(() => assertEffectVersionReleaseReady(["a"], { a: qualified }, "1.2.0")).toThrow("major release");
  });
  it("rejects this checkout until remaining groups qualify", async () => {
    const inventory = await Bun.file("docs/effect-version-inventory.json").json();
    expect(() => assertEffectVersionReleaseReady(Object.keys(plugin.rules), inventory, "2.0.0")).toThrow("not qualified");
  });
});
