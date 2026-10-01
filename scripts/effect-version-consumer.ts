export function diagnosticCounts(output: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const match of output.matchAll(/linteffect\(([A-Za-z0-9-]+)\)/g)) {
    const id = `linteffect/${match[1]}`;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
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
