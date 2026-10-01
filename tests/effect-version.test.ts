import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import plugin from "../src/index";
import { allRules, effect3, ruleGroups } from "../src/index";
import { effectVersionFor, withEffectVersionSchema, versionSensitiveRules, legacyOnlyRules } from "../src/effect-version";

const inventoryPath = "docs/effect-version-inventory.json";

describe("Effect version policy", () => {
  it("defaults to four", () => {
    expect(effectVersionFor([])).toBe(4);
    expect(effectVersionFor([{}])).toBe(4);
    expect(effectVersionFor([{ boundaryPaths: ["custom/**"] }])).toBe(4);
  });
  it("accepts three and four", () => {
    expect(effectVersionFor([{ effectVersion: 3 }])).toBe(3);
    expect(effectVersionFor([{ effectVersion: 4 }])).toBe(4);
  });
  it("rejects invalid versions", () => {
    for (const effectVersion of [2, 5, "3", null, undefined]) {
      expect(() => effectVersionFor([{ effectVersion }])).toThrow("effectVersion");
    }
  });
  it("does not share version state", () => {
    expect([3, 4, 3, 4].map((effectVersion) => effectVersionFor([{ effectVersion }]))).toEqual([3, 4, 3, 4]);
    expect(effectVersionFor([])).toBe(4);
  });
  it("preserves boundary and config path schemas", () => {
    const schema = [{ type: "object", properties: { boundaryPaths: { type: "array", items: { type: "string" } }, configPaths: { type: "array", items: { type: "string" } } }, additionalProperties: false }] as const;
    expect(withEffectVersionSchema(schema)).toEqual([{ ...schema[0], properties: { ...schema[0].properties, effectVersion: { type: "integer", enum: [3, 4] } } }]);
    expect(schema[0].properties).not.toHaveProperty("effectVersion");
    expect(withEffectVersionSchema([])).toEqual([{ type: "object", properties: { effectVersion: { type: "integer", enum: [3, 4] } }, additionalProperties: false }]);
  });
});

describe("Effect version audit inventory", () => {
  it("records only the packed probe as qualified and keeps other v4 rules pending", async () => {
    const inventory = await Bun.file(inventoryPath).json();
    expect(inventory["no-effect-fail-error-message"].qualification).toEqual({ "3": "qualified", "4": "qualified" });
    expect(inventory["no-hidden-effect-execution"].qualification[4]).toBe("pending");
    expect(inventory["no-catchall-generic-rethrow"].qualification[4]).toBe("pending");
    expect(inventory["no-run-effect-outside-boundary"].qualification[4]).toBe("pending");
  });
  it("keeps group applicability distinct from registration and qualification", async () => {
    const inventory = await Bun.file(inventoryPath).json();
    for (const groups of [ruleGroups, effect3.ruleGroups]) {
      for (const group of Object.values(groups)) {
        for (const id of Object.keys(group)) expect(inventory).toHaveProperty(id.slice(11));
      }
    }
    for (const [name, entry] of Object.entries(inventory) as Array<[string, any]>) {
      expect(Object.hasOwn(allRules, `linteffect/${name}`)).toBe(entry.applicability[4]);
      expect(Object.hasOwn(effect3.allRules, `linteffect/${name}`)).toBe(entry.applicability[3]);
    }
  });
  it("covers every registered rule and matches runtime policy", async () => {
    const inventory = await Bun.file(inventoryPath).json();
    expect(Object.keys(inventory).sort()).toEqual(Object.keys(plugin.rules).sort());
    expect(Object.keys(inventory).filter((name) => inventory[name].sensitive).sort()).toEqual([...versionSensitiveRules].sort());
    expect(Object.keys(inventory).filter((name) => !inventory[name].applicability[4]).sort()).toEqual([...legacyOnlyRules].sort());
    for (const entry of Object.values(inventory) as any[]) {
      expect(entry.evidence.length).toBeGreaterThan(0);
      for (const major of [3, 4]) {
        expect(["baseline", "pending", "qualified", "not-applicable"]).toContain(entry.qualification[major]);
        expect(entry.qualification[major] === "not-applicable").toBe(!entry.applicability[major]);
      }
    }
  });
  it("rejects a new registered rule missing from the inventory", async () => {
    const inventory = await Bun.file(inventoryPath).json();
    const registered = [...Object.keys(plugin.rules), "new-unaudited-rule"];
    expect(registered.filter((name) => !Object.hasOwn(inventory, name))).toEqual(["new-unaudited-rule"]);
  });
});

describe("Oxlint version option validation", () => {
  it("validates versions with and without existing boundary paths", () => {
    const root = mkdtempSync(join(tmpdir(), "oxlint-version-options-"));
    try {
      writeFileSync(join(root, "valid.ts"), "export const value = 1;\n");
      for (const rule of ["no-catchall-generic-rethrow", "no-early-catchall-null"]) {
        for (const version of [3, 4, 2, 5, "3", null]) {
          const options = rule === "no-early-catchall-null" ? { effectVersion: version, boundaryPaths: ["custom/**"] } : { effectVersion: version };
          writeFileSync(join(root, "config.json"), JSON.stringify({ categories: { correctness: "off" }, jsPlugins: [{ name: "linteffect", specifier: join(process.cwd(), "src/index.ts") }], rules: { [`linteffect/${rule}`]: ["error", options] } }));
          const result = spawnSync(join(process.cwd(), "node_modules/.bin/oxlint"), ["--config", join(root, "config.json"), join(root, "valid.ts")], { encoding: "utf8" });
          const output = `${result.stdout}${result.stderr}`;
          if (version === 3 || version === 4) {
            expect(output).not.toContain("effectVersion must");
            expect(result.status, output).toBe(0);
          } else {
            expect(result.status).not.toBe(0);
            expect(output).toContain("effectVersion");
          }
        }
      }
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
