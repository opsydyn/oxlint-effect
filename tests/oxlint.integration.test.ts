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
    expect(result.output).toContain("linteffect(no-raw-domain-primitive-params)");
    expect(result.output).toContain("linteffect(no-raw-time-domain-field)");
    expect(result.output).toContain("linteffect(no-overloaded-options-object)");
    expect(result.output).toContain("linteffect(no-domain-logic-in-conditional)");
    expect(result.output).toContain("linteffect(no-implicit-state-machine-object)");
    expect(result.output).toContain("linteffect(no-adhoc-domain-error)");
    expect(result.output).toContain("linteffect(no-domain-meaning-by-folder-only)");
    expect(result.output).toContain("linteffect(no-yield-without-star-in-effect-gen)");
    expect(result.output).toContain("linteffect(no-async-effect-combinator-callback)");
    expect(result.output).toContain("linteffect(no-run-effect-outside-boundary)");
    expect(result.output).toContain("linteffect(no-throw-in-effect-logic)");
    expect(result.output).toContain("linteffect(no-or-die-outside-boundary)");
    expect(result.output).toContain("linteffect(no-swallowed-catch-all)");
    expect(result.output).toContain("linteffect(no-effect-ignore)");
    expect(result.output).toContain("linteffect(no-try-catch-in-effect-logic)");
    expect(result.output).toContain("linteffect(no-promise-api-in-effect-logic)");
    expect(result.output).toContain("linteffect(no-public-generic-effect-error)");
    expect(result.output).toContain("linteffect(no-unbounded-effect-all)");
    expect(result.output).toContain("linteffect(no-fire-and-forget-fork)");
    expect(result.output).toContain("linteffect(no-fork-in-loop)");
    expect(result.output).toContain("linteffect(no-race-without-cleanup)");
    expect(result.output).toContain("linteffect(no-unobserved-fiber)");
    expect(result.output).toContain("linteffect(no-unbounded-concurrent-retry)");
    expect(result.output).toContain("linteffect(no-blocking-call-in-effect)");
    expect(result.output).toContain("linteffect(no-promise-concurrency-in-effect)");
    expect(result.output).toContain("linteffect(no-shared-mutable-state-across-fibers)");
    expect(result.output).toContain("linteffect(no-timeout-with-noninterruptible-promise)");
    expect(result.output).toContain("linteffect(no-uninterruptible-concurrent-region)");
    expect(result.output).toContain("linteffect(no-unbounded-queue-or-pubsub)");
    expect(result.output).toContain("linteffect(no-global-mutable-concurrency-state)");
    expect(result.output).toContain("linteffect(no-piped-yield-in-gen)");
    expect(result.output).toContain("linteffect(no-gen-for-mapping)");
    expect(result.output).toContain("linteffect(prefer-gen-for-workflow)");
    expect(result.output).toContain("linteffect(no-large-anonymous-flow)");
    expect(result.output).toContain("linteffect(no-effect-in-flow)");
    expect(result.output).toContain("linteffect(prefer-named-flow)");
    expect(result.output).toContain("linteffect(prefer-pipe-for-behavior)");
    expect(result.output).toContain("linteffect(prefer-decorated-effect-before-gen)");
    expect(result.output).toContain("linteffect(no-workflow-in-behavior-pipe)");
    expect(result.output).toContain("linteffect(no-mixed-pillar-function)");
    expect(result.output).toContain("linteffect(no-clever-effect-expression)");
    expect(result.output).toContain("linteffect(prefer-extracted-concept)");
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
