import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { assertCommandSuccess, assertDiagnosticCounts, assertDiagnosticCountsByFile, diagnosticCounts, diagnosticCountsByFile, selectedEffectVersions } from "../scripts/effect-version-consumer";

describe("Effect consumer diagnostics", () => {
  it("counts repeated warnings rather than deduplicating IDs", () => {
    expect(diagnosticCounts(JSON.stringify({ diagnostics: [
      { code: "linteffect(no-effect-fail-error-message)", filename: "src/failures.ts" },
      { code: "linteffect(no-effect-fail-error-message)", filename: "src/failures.ts" },
      { code: "linteffect(no-hidden-effect-execution)", filename: "src/domain.ts" },
    ] })))
      .toEqual({ "linteffect/no-effect-fail-error-message": 2, "linteffect/no-hidden-effect-execution": 1 });
  });
  it("counts diagnostic records, not rule labels in source or message text", () => {
    const output = JSON.stringify({ diagnostics: [{
      code: "linteffect(no-effect-fail-error-message)",
      filename: "src/failures.ts",
      message: 'source excerpt: "linteffect(no-effect-fail-error-message)"',
    }] });
    expect(diagnosticCounts(output)).toEqual({ "linteffect/no-effect-fail-error-message": 1 });
    expect(() => assertDiagnosticCounts(diagnosticCounts(output), { "linteffect/no-effect-fail-error-message": 2 })).toThrow("Unexpected diagnostics");
  });
  it("rejects malformed diagnostic output rather than treating it as clean", () => {
    for (const output of ["", "Found no warnings", "null", "{}", '{"diagnostics":{}}', '{"diagnostics":[{}]}']) {
      expect(() => diagnosticCounts(output)).toThrow();
    }
  });
  it("checks counts by file and rejects globally merged boundary exemptions", () => {
    const expected = {
      "src/mixed/effect3/modern-entry.ts": { "linteffect/no-hidden-effect-execution": 1 },
      "src/mixed/effect4/legacy-entry.ts": { "linteffect/no-hidden-effect-execution": 1 },
    };
    const output = JSON.stringify({ diagnostics: [
      { code: "linteffect(no-hidden-effect-execution)", filename: "src/mixed/effect3/modern-entry.ts" },
      { code: "linteffect(no-hidden-effect-execution)", filename: "src/mixed/effect4/legacy-entry.ts" },
    ] });
    expect(diagnosticCountsByFile(output)).toEqual(expected);
    expect(() => assertDiagnosticCountsByFile(diagnosticCountsByFile(output), expected)).not.toThrow();
    const leakedBoundaryOutput = JSON.stringify({ diagnostics: [] });
    expect(() => assertDiagnosticCountsByFile(diagnosticCountsByFile(leakedBoundaryOutput), expected)).toThrow("Unexpected diagnostics");
    const wrongFile = { "src/mixed/effect3/modern-entry.ts": { "linteffect/no-hidden-effect-execution": 2 } };
    expect(() => assertDiagnosticCountsByFile(wrongFile, expected)).toThrow("Unexpected diagnostics");
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
