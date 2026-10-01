import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { assertCommandSuccess, assertDiagnosticCounts, diagnosticCounts, selectedEffectVersions } from "../scripts/effect-version-consumer";

describe("Effect consumer diagnostics", () => {
  it("counts repeated warnings rather than deduplicating IDs", () => {
    expect(diagnosticCounts("x linteffect(no-effect-fail-error-message)\nx linteffect(no-effect-fail-error-message)\nx linteffect(no-hidden-effect-execution)"))
      .toEqual({ "linteffect/no-effect-fail-error-message": 2, "linteffect/no-hidden-effect-execution": 1 });
  });
  it("rejects missing, extra and wrong-count warnings", () => {
    const expected = { "linteffect/no-effect-fail-error-message": 2 };
    expect(() => assertDiagnosticCounts({}, expected)).toThrow("Unexpected diagnostics");
    expect(() => assertDiagnosticCounts({ ...expected, "linteffect/no-hidden-effect-execution": 1 }, expected)).toThrow("Unexpected diagnostics");
    expect(() => assertDiagnosticCounts({ "linteffect/no-effect-fail-error-message": 1 }, expected)).toThrow("Unexpected diagnostics");
    expect(() => assertDiagnosticCounts(expected, expected)).not.toThrow();
    expect(() => assertDiagnosticCounts({}, {})).not.toThrow();
  });
  it("rejects malformed expectations", () => {
    for (const expected of [null, [], "bad", { "linteffect/a": 0 }, { "linteffect/a": -1 }, { "linteffect/a": 1.5 }, { "linteffect/a": "1" }, { other: 1 }]) {
      expect(() => assertDiagnosticCounts({}, expected)).toThrow("Invalid diagnostic expectations");
    }
  });
  it("propagates child-process install and typecheck failures with output", () => {
    for (const label of ["install", "typecheck"]) {
      const result = spawnSync("bun", ["-e", `console.error("${label} failure evidence"); process.exit(7)`], { encoding: "utf8" });
      expect(() => assertCommandSuccess({ status: result.status, output: `${result.stdout}${result.stderr}` }, label)).toThrow(`${label} failure evidence`);
    }
    expect(() => assertCommandSuccess({ status: null, output: "interrupted" }, "typecheck")).toThrow("interrupted");
    expect(() => assertCommandSuccess({ status: 0, output: "ok" }, "install")).not.toThrow();
  });
  it("selects exactly the requested major and rejects unknown arguments", () => {
    expect(selectedEffectVersions([])).toEqual([3, 4]);
    expect(selectedEffectVersions(["--effect-version", "3"])).toEqual([3]);
    expect(selectedEffectVersions(["--effect-version", "4"])).toEqual([4]);
    for (const args of [["--effect-version"], ["--effect-version", "2"], ["--unknown"], ["--effect-version", "4", "ignored"]]) {
      expect(() => selectedEffectVersions(args)).toThrow("Usage");
    }
  });
});
