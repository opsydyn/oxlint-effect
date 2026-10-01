import { describe, expect, it } from "bun:test";
import { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertQualificationCoverage, resolveQualificationPath, validateQualificationCases } from "../scripts/effect-version-qualification";

const example = {
  rule: "no-example", version: 4 as const, classification: "unchanged" as const, variants: ["direct"],
  bad: ["src/example.bad.ts"], good: ["src/example.good.ts"],
  expectedByFile: { "src/example.bad.ts": { "linteffect/no-example": 1 } },
};
const inventory = { "no-example": { applicability: { "3": true, "4": true }, qualification: { "3": "baseline", "4": "qualified" } } };

describe("Effect qualification cases", () => {
  it("qualification rejects incomplete or fabricated evidence", () => {
    expect(validateQualificationCases([example], 4, ["no-example"])).toEqual([example]);
    for (const input of [null, {}, [null], [example, example], [{ ...example, rule: "unknown" }],
      [{ ...example, version: 3 }], [{ ...example, classification: "pretend" }],
      [{ ...example, classification: "legacy-only" }], [{ ...example, variants: [] }],
      [{ ...example, bad: [] }], [{ ...example, good: [] }],
      [{ ...example, good: example.bad }], [{ ...example, bad: ["../outside.ts"] }],
      [{ ...example, good: ["/outside.ts"] }], [{ ...example, runtime: "C:\\outside.ts" }],
      [{ ...example, runtime: example.bad[0] }], [{ ...example, expectedByFile: {} }],
      [{ ...example, expectedByFile: { "src/example.bad.ts": { "linteffect/no-example": 0 } } }],
      [{ ...example, expectedByFile: { "src/example.bad.ts": { "linteffect/no-example": -1 } } }],
      [{ ...example, expectedByFile: { "src/example.bad.ts": { "linteffect/another": 1 } } }],
      [{ ...example, expectedByFile: { "src/other.ts": { "linteffect/no-example": 1 } } }],
    ]) expect(() => validateQualificationCases(input, 4, ["no-example"])).toThrow();
  });

  it("qualification covers every applicable qualified rule", () => {
    const cases = validateQualificationCases([example], 4, ["no-example"]);
    expect(() => assertQualificationCoverage([], inventory, 4)).toThrow("missing case");
    expect(() => assertQualificationCoverage(cases, inventory, 4)).not.toThrow();
    expect(() => assertQualificationCoverage(cases, { ...inventory, extra: { applicability: { "4": true }, qualification: { "4": "qualified" } } }, 4)).toThrow("missing case");
    expect(() => assertQualificationCoverage(cases, { "no-example": { applicability: { "4": false }, qualification: { "4": "not-applicable" } } }, 4)).toThrow("not applicable");
  });

  it("qualification requires existing contained source files", async () => {
    const root = await mkdtemp(join(tmpdir(), "effect-qualification-paths-"));
    try {
      await mkdir(join(root, "src"));
      await writeFile(join(root, "src/good.ts"), "export {};");
      expect(await resolveQualificationPath(root, "src/good.ts")).toEndWith("src/good.ts");
      await symlink("/etc/hosts", join(root, "src/escape.ts"));
      for (const path of ["src/missing.ts", "src/escape.ts", "../outside.ts", "src"]) {
        await expect(resolveQualificationPath(root, path)).rejects.toThrow();
      }
    } finally { await rm(root, { recursive: true, force: true }); }
  });
});
