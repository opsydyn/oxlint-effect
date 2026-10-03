import { describe, expect, it } from "bun:test";
import path from "node:path";
import { effect3, ruleGroups } from "../src/index";

describe("packed group qualification evidence", () => {
  it("covers every group and rules-only companion in both consumer contracts", async () => {
    for (const major of [3, 4]) {
      const source = await Bun.file(`examples/effect${major}-consumer/src/composition.contracts.ts`).text();
      for (const name of Object.keys(ruleGroups)) expect(source).toContain(`"${name}"`);
      expect(source).toContain("Rules");
      expect(source).toContain("defineConfig");
      expect(source).toContain("21");
    }
  });
  it("ships current and explicitly legacy paired skill assets", async () => {
    for (const pair of ["domain", "domain-shapes", "domain-decisions", "domain-context", "public-errors", "error-preservation", "expected-state"]) {
      for (const kind of ["bad", "good"]) {
        expect(await Bun.file(`skills/oxlint-effect/assets/effect4/${pair}.${kind}.ts`).exists()).toBe(true);
        const legacy = await Bun.file(`skills/oxlint-effect/assets/${pair}.${kind}.ts`).text();
        expect(legacy).toContain("Legacy Effect 3");
      }
    }
  });
  it("links every indexed consumer failure and repair to an existing source", async () => {
    for (const major of [3, 4]) {
      const file = `examples/effect${major}-consumer/src/qualification/README.md`;
      const index = await Bun.file(file).text();
      for (const match of index.matchAll(/\]\(([^)]+)\)/g)) expect(await Bun.file(path.resolve(path.dirname(file), match[1]!)).exists()).toBe(true);
    }
  });
  it("records exact group membership and per-major evidence without prematurely qualifying", async () => {
    const groups = await Bun.file("docs/effect-version-groups.json").json();
    expect(Object.keys(groups).sort()).toEqual(Object.keys(ruleGroups).sort());
    for (const [name, rules] of Object.entries(ruleGroups)) {
      expect(Object.keys(groups[name].members).sort()).toEqual(Object.keys({ ...effect3.ruleGroups[name as keyof typeof ruleGroups], ...rules }).map(id => id.slice("linteffect/".length)).sort());
      for (const major of [3, 4]) {
        expect(groups[name].configEvidence[major]).toContain(`examples/effect${major}-consumer/src/composition.contracts.ts`);
        expect(groups[name].skillEvidence[major].length).toBeGreaterThan(0);
      }
    }
  });
});
