function diagnosticRecords(output: string): Array<{ id: string; filename: string }> {
  const document = JSON.parse(output) as { diagnostics?: unknown } | null;
  if (!document || !Array.isArray(document.diagnostics)) throw new Error("Invalid Oxlint diagnostic JSON");
  return document.diagnostics.map((record: unknown) => {
    const diagnostic = record as { code?: unknown; filename?: unknown } | null;
    if (!diagnostic || typeof diagnostic.code !== "string" || typeof diagnostic.filename !== "string") throw new Error("Invalid Oxlint diagnostic record");
    const code = /^([A-Za-z0-9-]+)\(([A-Za-z0-9-]+)\)$/.exec(diagnostic.code);
    if (!code) throw new Error(`Invalid Oxlint diagnostic code: ${diagnostic.code}`);
    return { id: `${code[1]}/${code[2]}`, filename: diagnostic.filename.replaceAll("\\", "/").replace(/^\.\//, "") };
  });
}

export function diagnosticCounts(output: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { id } of diagnosticRecords(output)) {
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export function diagnosticCountsByFile(output: string): Record<string, Record<string, number>> {
  const files = new Map<string, Record<string, number>>();
  for (const { id, filename } of diagnosticRecords(output)) {
    const counts = files.get(filename) ?? {};
    counts[id] = (counts[id] ?? 0) + 1;
    files.set(filename, counts);
  }
  return Object.fromEntries(files);
}

export function assertDiagnosticCountsByFile(actual: Record<string, Record<string, number>>, expected: Record<string, Record<string, number>>): void {
  for (const filename of new Set([...Object.keys(actual), ...Object.keys(expected)])) {
    try { assertDiagnosticCounts(actual[filename] ?? {}, expected[filename] ?? {}); }
    catch (error) { throw new Error(`Unexpected diagnostics in ${filename}`, { cause: error }); }
  }
}

export function assertDiagnosticCounts(actual: Record<string, number>, expected: unknown): void {
  if (typeof expected !== "object" || expected === null || Array.isArray(expected)
    || Object.entries(expected).some(([id, count]) => !/^linteffect\/[A-Za-z0-9-]+$/.test(id) || !Number.isInteger(count) || (count as number) <= 0)) {
    throw new Error("Invalid diagnostic expectations");
  }
  const wanted = expected as Record<string, number>;
  const mismatches = [...new Set([...Object.keys(actual), ...Object.keys(wanted)])]
    .filter((id) => actual[id] !== wanted[id]).sort();
  if (mismatches.length) throw new Error(`Unexpected diagnostics: ${mismatches.map((id) => `${id}: expected ${wanted[id] ?? 0}, observed ${actual[id] ?? 0}`).join("; ")}`);
}

export function assertCommandSuccess(result: { status: number | null; output: string }, label: string): void {
  if (result.status !== 0) throw new Error(`${label} failed (exit ${result.status}):\n${result.output}`);
}

export function selectedEffectVersions(args: readonly string[]): readonly (3 | 4)[] {
  if (args.length === 0) return [3, 4];
  if (args.length === 2 && args[0] === "--effect-version" && (args[1] === "3" || args[1] === "4")) return [Number(args[1]) as 3 | 4];
  throw new Error("Usage: verify-effect-version-consumers.ts [--effect-version 3|4]");
}
