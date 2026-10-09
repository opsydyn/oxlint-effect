const expected = [
  "no-adhoc-domain-error",
  "no-boolean-domain-flag",
  "no-raw-domain-id-alias",
].sort();

for (const config of ["oxlint.config.ts", "oxlint.recommended.config.ts"]) {
  for (const [file, rules] of [
    ["src/domain.bad.ts", expected],
    ["src/domain.good.ts", []],
  ] as const) {
    const result = Bun.spawnSync([
      "bunx", "--no-install", "oxlint", "--config", config, "--format", "json", file,
    ]);
    const stdout = new TextDecoder().decode(result.stdout);
    const stderr = new TextDecoder().decode(result.stderr);
    const report = JSON.parse(stdout) as {
      diagnostics: Array<{ code: string; filename: string; severity: string }>;
    };
    const observed = report.diagnostics.map((diagnostic) => diagnostic.code).sort();
    const expectedCodes = rules.map((rule) => `linteffect(${rule})`).sort();
    const expectedExit = rules.length === 0 ? 0 : 1;
    if (result.exitCode !== expectedExit || JSON.stringify(observed) !== JSON.stringify(expectedCodes)
      || report.diagnostics.some((diagnostic) => diagnostic.filename !== file || diagnostic.severity !== "error")) {
      throw new Error(`${config} / ${file}: expected exit ${expectedExit} and ${JSON.stringify(expectedCodes)}, got exit ${result.exitCode} and ${JSON.stringify(observed)}\n${stdout}${stderr}`);
    }
  }
}

console.log("Published 2.0.0 / Effect 4: three annotated failures and clean repairs verified under DDD and recommended presets.");
