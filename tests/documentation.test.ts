import { describe, expect, it } from "bun:test";
import path from "node:path";
import { existsSync } from "node:fs";

describe("published v2 documentation", () => {
  it("starts with a runnable current-major quick start", async () => {
    const readme = await Bun.file("README.md").text();
    expect(readme.indexOf("## Quick Start")).toBeGreaterThan(0);
    expect(readme.indexOf("## Quick Start")).toBeLessThan(readme.indexOf("## Effect Versions"));
    expect(readme).toContain("oxlint.config.ts");
    expect(readme).toContain("bunx oxlint --config oxlint.config.ts src");
    expect(readme).not.toMatch(/unreleased|remain blocked at version 1\.2\.0/);
    expect(readme).toContain("examples/npm-effect4-consumer/README.md");
    const snippet = readme.match(/```ts\n([\s\S]*?)```/)?.[1];
    expect(snippet?.trim()).toBe((await Bun.file("examples/npm-effect4-consumer/oxlint.recommended.config.ts").text()).trim());
  });

  it("makes packaged current-major skill examples primary", async () => {
    for (const file of ["skills/oxlint-effect/SKILL.md", "skills/oxlint-effect/references/configuration.md"]) {
      const text = await Bun.file(file).text();
      expect(text).not.toContain("unreleased");
    }
    const readme = await Bun.file("README.md").text();
    const skillSection = readme.slice(readme.indexOf("## Agent Skill"), readme.indexOf("## Rule Groups"));
    expect(skillSection).toContain("assets/effect4/domain.bad.ts");
    expect(skillSection).not.toContain("assets currently target Effect 3");
  });

  it("retains legacy QA and pins a real registry-backed v2 example", async () => {
    const current = await Bun.file("examples/npm-effect4-consumer/package.json").json();
    expect(current.devDependencies["@opsydyn/oxlint-effect"]).toBe("2.0.0");
    expect(current.dependencies.effect).toBe("4.0.0");
    expect(current.scripts.qa).toBe("bun scripts/verify.ts");
    const config = await Bun.file("examples/npm-effect4-consumer/tsconfig.json").json();
    expect(config.compilerOptions.lib).toContain("ESNext.Disposable");
    const legacy = await Bun.file("examples/npm-consumer/package.json").json();
    expect(legacy.devDependencies["@opsydyn/oxlint-effect"]).toBe("^1.0.0");
    expect(await Bun.file("examples/npm-consumer/README.md").text()).toContain("Legacy Effect 3");
    const failures = await Bun.file("examples/npm-effect4-consumer/src/domain.bad.ts").text();
    expect([...failures.matchAll(/EXPECT: linteffect\/([a-z0-9-]+)/g)].map(match => match[1]!).sort())
      .toEqual(["no-adhoc-domain-error", "no-boolean-domain-flag", "no-raw-domain-id-alias"]);
  });

  it("keeps onboarding links resolvable in the checkout", async () => {
    for (const file of ["README.md", "examples/README.md", "examples/npm-effect4-consumer/README.md"]) {
      const text = await Bun.file(file).text();
      for (const match of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
        const target = match[1]!;
        if (/^https?:/.test(target)) continue;
        expect({ file, target, exists: existsSync(path.resolve(path.dirname(file), target)) })
          .toMatchObject({ exists: true });
      }
    }
  });
});
