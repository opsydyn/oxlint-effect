import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const fixtureRoot = path.join(repoRoot, "tests", "fixtures", "oxlint");
const oxlintBin = path.join(repoRoot, "node_modules", ".bin", "oxlint");

function runOxlint(fileName: string) {
  const result = spawnSync(
    oxlintBin,
    [
      "--config",
      path.join(fixtureRoot, "oxlint.config.ts"),
      path.join(fixtureRoot, fileName),
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  );

  return {
    status: result.status ?? 1,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}

describe("linteffect oxlint integration", () => {
  it("reports linteffect diagnostics through the oxlint CLI", () => {
    const result = runOxlint("invalid.ts");

    expect(result.status).toBe(1);
    expect(result.output).toContain("linteffect(no-react-state)");
    expect(result.output).toContain("linteffect(no-effect-as)");
    expect(result.output).toContain("linteffect(no-effect-bind)");
    expect(result.output).toContain("linteffect(no-runtime-runfork)");
    expect(result.output).toContain("linteffect(no-effect-async)");
    expect(result.output).toContain("linteffect(prevent-dynamic-imports)");
    expect(result.output).toContain("linteffect(no-nested-effect-call)");
    expect(result.output).toContain("linteffect(no-effect-ladder)");
    expect(result.output).toContain("linteffect(no-flatmap-ladder)");
    expect(result.output).toContain("linteffect(no-pipe-ladder)");
    expect(result.output).toContain("linteffect(no-call-tower)");
    expect(result.output).toContain("linteffect(no-effect-orElse-ladder)");
    expect(result.output).toContain("linteffect(no-ternary)");
    expect(result.output).toContain("linteffect(no-return-null)");
    expect(result.output).toContain("linteffect(no-option-as)");
    expect(result.output).toContain("linteffect(no-effect-never)");
    expect(result.output).toContain("linteffect(no-arrow-ladder)");
    expect(result.output).toContain("linteffect(no-branch-in-object)");
    expect(result.output).toContain("linteffect(no-iife-wrapper)");
    expect(result.output).toContain("linteffect(no-return-in-arrow)");
    expect(result.output).toContain("linteffect(no-return-in-callback)");
    expect(result.output).toContain("linteffect(no-effect-fn-generator)");
    expect(result.output).toContain("linteffect(no-effect-sync-console)");
    expect(result.output).toContain("linteffect(no-nested-effect-gen)");
    expect(result.output).toContain("linteffect(no-match-void-branch)");
    expect(result.output).toContain("linteffect(no-match-effect-branch)");
    expect(result.output).toContain("linteffect(warn-effect-sync-wrapper)");
    expect(result.output).toContain("linteffect(no-effect-side-effect-wrapper)");
    expect(result.output).toContain("linteffect(no-effect-all-step-sequencing)");
    expect(result.output).toContain("linteffect(no-try-catch)");
    expect(result.output).toContain("linteffect(no-effect-wrapper-alias)");
    expect(result.output).toContain("linteffect(no-manual-effect-channels)");
    expect(result.output).toContain("linteffect(no-wrapgraphql-catchall)");
    expect(result.output).toContain("linteffect(no-render-side-effects)");
    expect(result.output).toContain("linteffect(no-atom-registry-effect-sync)");
    expect(result.output).toContain("linteffect(no-family-collection-read)");
    expect(result.output).toContain("linteffect(no-inline-runtime-provide)");
    expect(result.output).toContain("linteffect(no-naked-object-state-update)");
    expect(result.output).toContain("linteffect(no-effect-succeed-variable)");
    expect(result.output).toContain("linteffect(no-effect-type-alias)");
    expect(result.output).toContain("linteffect(no-model-overlay-cast)");
    expect(result.output).toContain("linteffect(no-unknown-boolean-coercion-helper)");
    expect(result.output).toContain("linteffect(no-fromnullable-nullish-coalesce)");
    expect(result.output).toContain("linteffect(no-option-boolean-normalization)");
    expect(result.output).toContain("linteffect(no-string-sentinel-return)");
    expect(result.output).toContain("linteffect(no-string-sentinel-const)");
    expect(result.output).toContain("linteffect(no-raw-domain-id-alias)");
    expect(result.output).toContain("linteffect(no-boolean-domain-flag)");
    expect(result.output).toContain("linteffect(no-magic-domain-string)");
  });

  it("allows a clean Effect-style fixture", () => {
    const result = runOxlint("valid.ts");

    expect(result.status).toBe(0);
    expect(result.output).not.toContain("linteffect(");
  });

  it("allows imperative branching outside Effect files", () => {
    const result = runOxlint("plain-branching.ts");

    expect(result.status).toBe(0);
    expect(result.output).not.toContain("linteffect(no-if-statement)");
    expect(result.output).not.toContain("linteffect(no-switch-statement)");
  });

  it("reports imperative branching in Effect files", () => {
    const result = runOxlint("effect-branching.ts");

    expect(result.status).toBe(1);
    expect(result.output).toContain("linteffect(no-if-statement)");
    expect(result.output).toContain("linteffect(no-switch-statement)");
  });
});
