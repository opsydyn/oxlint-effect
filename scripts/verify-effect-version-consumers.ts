import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { assertCommandSuccess, assertDiagnosticCounts, assertDiagnosticCountsByFile, diagnosticCounts, diagnosticCountsByFile, qualificationSelection } from "./effect-version-consumer.ts";
import { assertQualificationCoverage, resolveQualificationPath, validateQualificationCases } from "./effect-version-qualification.ts";
import { assertEffectVersionReleaseReady } from "./effect-version-release.ts";
import plugin from "../src/index.ts";

const { majors, requireComplete } = qualificationSelection(process.argv.slice(2));
const repoRoot = resolve(import.meta.dir, "..");
const inventory = await Bun.file(join(repoRoot, "docs/effect-version-inventory.json")).json();
if (requireComplete) assertEffectVersionReleaseReady(Object.keys(plugin.rules), inventory, "2.0.0");
const workspace = await mkdtemp(join(tmpdir(), "oxlint-effect-versions-"));

function run(command: string, args: string[], cwd: string, timeout?: number) {
  const result = spawnSync(command, args, {
    cwd, encoding: "utf8", timeout,
    env: { ...process.env, npm_config_cache: join(workspace, "npm-cache"), npm_config_ignore_scripts: "true" },
  });
  if (result.error) throw new Error(`Could not execute ${command}: ${result.error.message}`);
  return { status: result.status, output: `${result.stdout}${result.stderr}`, stdout: result.stdout };
}

async function installedVersions(root: string): Promise<Record<string, string>> {
  const versions: Record<string, string> = {};
  async function scan(modules: string) {
    const entries = await readdir(modules, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const path = join(modules, entry.name);
      if (entry.name.startsWith("@")) { await scan(path); continue; }
      const file = Bun.file(join(path, "package.json"));
      if (await file.exists()) versions[path.slice(root.length + 1)] = (await file.json()).version;
      await scan(join(path, "node_modules"));
    }
  }
  await scan(join(root, "node_modules"));
  return versions;
}

function verifyLint(root: string, config: string, files: string[], expected: unknown, status: number, expectedByFile?: Record<string, Record<string, number>>) {
  const result = run(join(root, "node_modules/.bin/oxlint"), ["--format", "json", "--config", config, ...files], root);
  if (result.status !== status) throw new Error(`Lint expected exit ${status}, received ${result.status}:\n${result.output}`);
  try {
    assertDiagnosticCounts(diagnosticCounts(result.stdout), expected);
    if (expectedByFile) assertDiagnosticCountsByFile(diagnosticCountsByFile(result.stdout), expectedByFile);
  }
  catch (error) { throw new Error(`Lint diagnostic gate failed:\n${result.output}`, { cause: error }); }
}

try {
  const pack = run("npm", ["pack", "--json", "--pack-destination", workspace], repoRoot);
  assertCommandSuccess(pack, "npm pack");
  const packed: unknown = JSON.parse(pack.stdout);
  if (!Array.isArray(packed) || packed.length !== 1 || typeof packed[0]?.filename !== "string" || basename(packed[0].filename) !== packed[0].filename) throw new Error("npm pack returned an invalid tarball filename");
  const tarball = join(workspace, packed[0].filename);
  const rootPackage = await Bun.file(join(repoRoot, "package.json")).json();
  for (const major of majors) {
    const root = join(workspace, `effect${major}`);
    await cp(join(repoRoot, `examples/effect${major}-consumer`), root, { recursive: true, filter: (path) => !path.split(/[\\/]/).includes("node_modules") });
    const originalLock = await readFile(join(root, "bun.lock"), "utf8");
    assertCommandSuccess(run("bun", ["install", "--frozen-lockfile", "--ignore-scripts"], root), "frozen consumer install");
    const before = await installedVersions(root);
    assertCommandSuccess(run("npm", ["install", "--no-save", "--package-lock=false", "--ignore-scripts", tarball], root), "packed plugin install");
    const after = await installedVersions(root);
    for (const [path, version] of Object.entries(before)) {
      if (after[path] !== version) throw new Error(`Packed install changed locked dependency ${path}: ${version} -> ${after[path]}`);
    }
    if (originalLock !== await readFile(join(root, "bun.lock"), "utf8")) throw new Error("Packed install changed the consumer lockfile");
    const manifest = await Bun.file(join(root, "package.json")).json();
    for (const [name, version] of Object.entries(manifest.devDependencies)) {
      const installed = await Bun.file(join(root, "node_modules", name, "package.json")).json();
      if (installed.version !== version) throw new Error(`Expected ${name}@${version}, installed ${installed.version}`);
    }
    const installedPlugin = await Bun.file(join(root, "node_modules/@opsydyn/oxlint-effect/package.json")).json();
    if (installedPlugin.version !== rootPackage.version || installedPlugin.name !== rootPackage.name) throw new Error("Consumer did not install the packed plugin version");
    assertCommandSuccess(run("bun", ["run", "typecheck"], root), `Effect ${major} typecheck`);
    const cases = validateQualificationCases(await Bun.file(join(root, "qualification-cases.json")).json(), major, Object.keys(plugin.rules));
    assertQualificationCoverage(cases, inventory, major);
    const runtimeChecks = new Set<string>();
    for (const entry of cases) {
      for (const path of [...entry.bad, ...entry.good, ...(entry.runtime ? [entry.runtime] : [])]) await resolveQualificationPath(root, path);
      const config = "oxlint.qualification.generated.json";
      await writeFile(join(root, config), JSON.stringify({
        categories: { correctness: "off" },
        jsPlugins: [{ name: "linteffect", specifier: "@opsydyn/oxlint-effect" }],
        rules: { [`linteffect/${entry.rule}`]: inventory[entry.rule].sensitive ? ["error", { effectVersion: major }] : "error" },
      }));
      const expected: Record<string, number> = {};
      for (const counts of Object.values(entry.expectedByFile)) {
        for (const [id, count] of Object.entries(counts)) expected[id] = (expected[id] ?? 0) + count;
      }
      verifyLint(root, config, entry.bad, expected, 1, entry.expectedByFile);
      verifyLint(root, config, entry.good, {}, 0);
      if (entry.runtime) runtimeChecks.add(entry.runtime);
    }
    for (const path of runtimeChecks) {
      const marker = `Runtime contract completed: ${path}`;
      const script = `await import(${JSON.stringify(pathToFileURL(join(root, path)).href)}); console.log(${JSON.stringify(marker)});`;
      assertCommandSuccess(run("bun", ["-e", script], root, 60_000), `Effect ${major} runtime contract ${path}`, marker);
    }
    verifyLint(root, "oxlint.fork-opposite.config.ts", ["src/qualification/concurrencySafety/no-fire-and-forget-fork.bad.ts", "src/qualification/concurrencySafety/no-fork-in-loop.bad.ts"], {}, 0);
    verifyLint(root, "oxlint.fork-opposite.config.ts", ["src/qualification/concurrencySafety/no-race-without-cleanup.bad.ts", "src/qualification/concurrencySafety/no-unobserved-fiber.bad.ts"], { "linteffect/no-race-without-cleanup": 2 }, 1, {
      "src/qualification/concurrencySafety/no-race-without-cleanup.bad.ts": { "linteffect/no-race-without-cleanup": 2 },
      "src/qualification/concurrencySafety/no-unobserved-fiber.bad.ts": {},
    });
    if (major === 4) {
      verifyLint(root, "oxlint.legacy-accessors.config.ts", ["src/qualification/serviceAndLayerArchitecture/legacy-accessors-exclusion.ts"], {}, 0);
      verifyLint(root, "oxlint.legacy-dependencies.config.ts", ["src/qualification/serviceAndLayerArchitecture/legacy-dependencies-exclusion.ts"], {}, 0);
    }
    const expected: unknown = await Bun.file(join(root, "expected-diagnostics.json")).json();
    verifyLint(root, "oxlint.config.ts", ["src/failures.ts"], expected, 1);
    verifyLint(root, "oxlint.config.ts", ["src/valid.ts", "src/config-contract.ts"], {}, 0);
    const batchExpected = await Bun.file(join(root, "expected-diagnostics.recovery-runtime.json")).json() as Record<string, Record<string, number>>;
    for (const file of ["rethrow", "fallback", "runners"]) {
      const path = `src/recovery-runtime/${file}.ts`;
      verifyLint(root, "oxlint.recovery-runtime.config.ts", [path], batchExpected[path], 1, { [path]: batchExpected[path] });
    }
    verifyLint(root, "oxlint.recovery-runtime.config.ts", ["src/recovery-runtime/valid.ts", "src/recovery-runtime/main.ts", "src/recovery-runtime/custom-entry.ts", "src/recovery-runtime/mixed-other.ts", "src/recovery-runtime/contracts.ts"], {}, 0);
    verifyLint(root, "oxlint.recovery-runtime.config.ts", ["src/recovery-runtime"], {
      "linteffect/no-catchall-generic-rethrow": major === 3 ? 4 : 5,
      "linteffect/no-early-catchall-null": major === 3 ? 6 : 7,
      "linteffect/no-run-effect-outside-boundary": major === 3 ? 6 : 12,
    }, 1, batchExpected);
    verifyLint(root, "oxlint.recovery-runtime.config.ts", ["src/recovery-runtime/mixed-matching.ts", "src/recovery-runtime/mixed-other.ts"], batchExpected["src/recovery-runtime/mixed-matching.ts"], 1, {
      "src/recovery-runtime/mixed-matching.ts": batchExpected["src/recovery-runtime/mixed-matching.ts"],
    });
    verifyLint(root, "oxlint.recovery-runtime.custom.config.ts", ["src/recovery-runtime/main.ts", "src/recovery-runtime/custom-entry.ts"], {
      "linteffect/no-early-catchall-null": 1, "linteffect/no-run-effect-outside-boundary": 1,
    }, 1, {
      "src/recovery-runtime/main.ts": { "linteffect/no-early-catchall-null": 1, "linteffect/no-run-effect-outside-boundary": 1 },
    });
    assertCommandSuccess(run("bun", ["src/recovery-runtime/contracts.ts"], root), `Effect ${major} recovery runtime contracts`);
    verifyLint(root, "oxlint.mixed.config.ts", ["src/mixed"], { "linteffect/no-hidden-effect-execution": 4 }, 1, {
      "src/mixed/effect3.ts": { "linteffect/no-hidden-effect-execution": 1 },
      "src/mixed/effect4.ts": { "linteffect/no-hidden-effect-execution": 1 },
      "src/mixed/effect3/modern-entry.ts": { "linteffect/no-hidden-effect-execution": 1 },
      "src/mixed/effect4/legacy-entry.ts": { "linteffect/no-hidden-effect-execution": 1 },
    });
    const invalid = run(join(root, "node_modules/.bin/oxlint"), ["--config", "oxlint.invalid.config.json", "src/valid.ts"], root);
    if (invalid.status === 0 || !invalid.output.includes("effectVersion")) throw new Error(`Invalid version unexpectedly accepted:\n${invalid.output}`);
    console.log(`Effect ${major}: packed declarations, recovery/runtime counts and contracts, clean controls, mixed-major paths and invalid options passed`);
  }
} finally { await rm(workspace, { recursive: true, force: true }); }
