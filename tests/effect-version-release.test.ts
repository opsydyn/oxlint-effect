import { describe, expect, it } from "bun:test";
import plugin from "../src/index";
import { assertEffectVersionReleaseReady } from "../scripts/effect-version-release";
import * as release from "../scripts/effect-version-release";

const qualified = { applicability: { "3": true, "4": true }, qualification: { "3": "qualified", "4": "qualified" } };

const group = () => ({ ...structuredClone(qualified), members: { a: { ...structuredClone(qualified), classification: { "3": "unchanged", "4": "adapted" }, evidence: { "3": ["legacy case"], "4": ["current case"] } } }, configEvidence: { "3": ["legacy config"], "4": ["current config"] }, skillEvidence: { "3": ["legacy skill"], "4": ["current skill"] } });
const groupGuard = (groups: unknown, names: readonly string[]) => (release as unknown as { assertEffectGroupReleaseReady(groups: unknown, names: readonly string[]): void }).assertEffectGroupReleaseReady(groups, names);

describe("Effect group release gate", () => {
  it("requires exact exported group coverage", () => {
    expect(() => groupGuard({ ddd: group() }, ["ddd"])).not.toThrow();
    expect(() => groupGuard({}, ["ddd"])).toThrow("groups");
    expect(() => groupGuard({ ddd: group(), extra: group() }, ["ddd"])).toThrow("groups");
    for (const value of [null, [], "qualified"]) expect(() => groupGuard(value, ["ddd"])).toThrow("groups");
  });
  it("rejects a qualified group with pending applicable members", () => {
    for (const major of [3, 4]) {
      const row = group(); row.members.a.qualification[major as 3 | 4] = "pending";
      expect(() => groupGuard({ ddd: row }, ["ddd"])).toThrow("member");
      const pending = group(); pending.qualification[major as 3 | 4] = "pending";
      expect(() => groupGuard({ ddd: pending }, ["ddd"])).toThrow("qualified");
    }
  });
  it("rejects absent, blank or malformed configuration and packaged skill evidence", () => {
    for (const field of ["configEvidence", "skillEvidence"] as const) for (const major of [3, 4]) for (const value of [[], [""], [null], undefined]) {
      const row: any = group(); row[field][major] = value;
      expect(() => groupGuard({ ddd: row }, ["ddd"])).toThrow("evidence");
    }
  });
  it("requires real member applicability, classification and evidence", () => {
    for (const change of [(row: any) => { row.members = {}; }, (row: any) => { row.members.a.applicability[4] = "true"; }, (row: any) => { row.members.a.classification[4] = "missing"; }, (row: any) => { row.members.a.evidence[4] = []; }]) {
      const row = group(); change(row);
      expect(() => groupGuard({ ddd: row }, ["ddd"])).toThrow("member");
    }
  });
  it("accepts explicitly inapplicable current legacy members, not fictional qualification", () => {
    const row = group(); const legacy: any = structuredClone(row.members.a);
    legacy.applicability[4] = false; legacy.qualification[4] = "not-applicable"; legacy.classification[4] = "legacy-only"; legacy.evidence[4] = [];
    (row.members as any).legacy = legacy;
    expect(() => groupGuard({ ddd: row }, ["ddd"])).not.toThrow();
    legacy.qualification[4] = "qualified";
    expect(() => groupGuard({ ddd: row }, ["ddd"])).toThrow("member");
  });
  it("rejects a legacy-only classification that claims current applicability", () => {
    const row = group(); row.members.a.classification[4] = "legacy-only";
    expect(() => groupGuard({ ddd: row }, ["ddd"])).toThrow("member");
  });
});

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
