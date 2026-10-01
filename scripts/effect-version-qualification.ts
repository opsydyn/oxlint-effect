import { realpath, stat } from "node:fs/promises";
import { isAbsolute, resolve, sep } from "node:path";

export type QualificationCase = {
  rule: string;
  version: 3 | 4;
  classification: "unchanged" | "adapted" | "legacy-only";
  variants: string[];
  bad: string[];
  good: string[];
  expectedByFile: Record<string, Record<string, number>>;
  runtime?: string;
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sourcePath(path: unknown): path is string {
  return typeof path === "string" && /^src\/.+\.(?:ts|tsx)$/.test(path)
    && !isAbsolute(path) && !path.includes("\\") && !path.includes("\0")
    && path.split("/").every((segment) => segment !== ".." && segment !== "." && segment !== "");
}

function sourcePaths(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(sourcePath) && new Set(value).size === value.length;
}

export function validateQualificationCases(cases: unknown, version: 3 | 4, registeredRules: readonly string[]): QualificationCase[] {
  if (!Array.isArray(cases)) throw new Error("Qualification cases must be an array");
  const seen = new Set<string>();
  return cases.map((input: unknown) => {
    if (!record(input) || typeof input.rule !== "string" || !registeredRules.includes(input.rule) || seen.has(input.rule)) throw new Error("Unknown or duplicate qualification rule");
    seen.add(input.rule);
    const bad = input.bad;
    const allowed = ["rule", "version", "classification", "variants", "bad", "good", "expectedByFile", "runtime"];
    if (Object.keys(input).some((key) => !allowed.includes(key)) || input.version !== version
      || !["unchanged", "adapted", "legacy-only"].includes(String(input.classification))
      || (version === 4 && input.classification === "legacy-only")
      || !Array.isArray(input.variants) || input.variants.length === 0
      || input.variants.some((variant) => typeof variant !== "string" || !variant.trim())
      || new Set(input.variants).size !== input.variants.length
      || !sourcePaths(bad) || !sourcePaths(input.good)
      || input.good.some((path) => bad.includes(path))
      || (input.runtime !== undefined && (!sourcePath(input.runtime) || bad.includes(input.runtime)))) {
      throw new Error(`Invalid qualification evidence for ${input.rule}`);
    }
    const expected = input.expectedByFile;
    if (!record(expected) || Object.keys(expected).length !== bad.length
      || bad.some((path) => !Object.hasOwn(expected, path))
      || Object.entries(expected).some(([path, counts]) => !bad.includes(path) || !record(counts)
        || Object.keys(counts).length !== 1 || !Object.hasOwn(counts, `linteffect/${input.rule}`)
        || !Number.isSafeInteger(counts[`linteffect/${input.rule}`]) || (counts[`linteffect/${input.rule}`] as number) <= 0)) {
      throw new Error(`Invalid diagnostic expectations for ${input.rule}`);
    }
    return input as QualificationCase;
  });
}

export function assertQualificationCoverage(cases: readonly QualificationCase[], inventory: Record<string, unknown>, version: 3 | 4): void {
  const indexed = new Map(cases.map((entry) => [entry.rule, entry]));
  for (const entry of cases) {
    const row = inventory[entry.rule];
    if (!record(row) || !record(row.applicability) || row.applicability[version] !== true) throw new Error(`${entry.rule} is not applicable to Effect ${version}`);
  }
  for (const [rule, input] of Object.entries(inventory)) {
    if (!record(input) || !record(input.applicability) || !record(input.qualification)) throw new Error(`Invalid inventory entry ${rule}`);
    if (input.applicability[version] === true && input.qualification[version] === "qualified" && !indexed.has(rule)) throw new Error(`${rule}: missing case for Effect ${version}`);
  }
}

export async function resolveQualificationPath(root: string, path: string): Promise<string> {
  if (!sourcePath(path)) throw new Error(`Unsafe qualification path ${path}`);
  const canonicalRoot = await realpath(root);
  const canonicalPath = await realpath(resolve(root, path));
  if (!canonicalPath.startsWith(`${canonicalRoot}${sep}`) || !(await stat(canonicalPath)).isFile()) throw new Error(`Qualification path escapes consumer: ${path}`);
  return canonicalPath;
}
