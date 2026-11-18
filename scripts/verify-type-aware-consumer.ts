import { spawnSync } from "node:child_process";
import { access, cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

type CommandResult = {
  status: number;
  stdout: string;
  stderr: string;
  output: string;
};

const expectationPattern = /\/\/ EXPECT: (linteffect|typescript)\/([a-z]+(?:-[a-z]+)*)/g;
const observedRulePattern = /^(linteffect|typescript)\(([a-z]+(?:-[a-z]+)*)\)$/;

function run(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = process.env): CommandResult {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: command === "npm"
      ? { ...env, npm_config_cache: npmCacheRoot, npm_config_ignore_scripts: "true" }
      : env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.error !== undefined) {
    throw new Error(`Failed to run ${command} ${args.join(" ")}: ${result.error.message}`);
  }

  if (result.status === null) {
    throw new Error(`Failed to run ${command} ${args.join(" ")}: terminated by ${result.signal ?? "an unknown signal"}`);
  }

  const stdout = result.stdout;
  const stderr = result.stderr;

  return {
    status: result.status,
    stdout,
    stderr,
    output: `${stdout}${stderr}`,
  };
}

async function sourceFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : entry.isFile() && path.endsWith(".ts")
        ? [path]
        : [];
  }));

  return paths.flat();
}

async function expectedRuleIds(root: string): Promise<string[]> {
  const expected: string[] = [];
  const files = await sourceFiles(root);

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(expectationPattern)) {
      expected.push(`${match[1]}/${match[2]}`);
    }
  }

  return expected.sort();
}

function observedRuleIds(result: CommandResult): string[] {
  try {
    const { diagnostics } = JSON.parse(result.stdout) as { diagnostics: Array<{ code?: string; message: string }> };
    return diagnostics.map(({ code, message }) => {
      const match = code?.match(observedRulePattern);
      return match ? `${match[1]}/${match[2]}` : code ?? message;
    }).sort();
  } catch (error) {
    throw new Error(`Expected Oxlint JSON diagnostics:\n${result.output}`, { cause: error });
  }
}

function assertExpectedDiagnostics(result: CommandResult, expected: string[]): void {
  const status = expected.length ? 1 : 0;
  if (result.status !== status) {
    throw new Error(`Expected lint to exit ${status}, received ${result.status}:\n${result.output}`);
  }
  const observed = observedRuleIds(result);
  if (JSON.stringify(observed) !== JSON.stringify(expected)) {
    throw new Error(
      `Unexpected lint diagnostics:\nexpected: ${expected.join(", ")}\nobserved: ${observed.join(", ")}\n${result.output}`,
    );
  }
}

function assertSuccess(result: CommandResult, command: string): void {
  if (result.status !== 0) {
    throw new Error(`${command} failed:\n${result.output}`);
  }
}

const repoRoot = resolve(import.meta.dir, "..");
const args = process.argv.slice(2);
const useTsrs = args[0] === "--tsrs";
if (args.length > 1 || (args.length === 1 && !useTsrs)) {
  throw new Error("Usage: bun scripts/verify-type-aware-consumer.ts [--tsrs]");
}
if (useTsrs && process.platform !== "darwin" && process.platform !== "linux") {
  throw new Error("The optional tsrs verifier targets macOS and Linux.");
}

let packRoot: string | undefined;
let npmCacheRoot: string | undefined;
let consumerTempRoot: string | undefined;

async function verifyConsumer(root: string, tarball: string, major: 3 | 4): Promise<void> {
  const fixture = join(repoRoot, "examples/type-aware-consumer");
  const config = major === 4 ? "oxlint.effect4.config.ts" : "oxlint.config.ts";
  for (const file of new Set(["src", "tsconfig.json", "oxlint.config.ts", config])) {
    await cp(join(fixture, file), join(root, file), { recursive: true });
  }

  const manifest = JSON.parse(await readFile(join(fixture, "package.json"), "utf8")) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  manifest.dependencies["@opsydyn/oxlint-effect"] = `file:${tarball}`;
  if (useTsrs) {
    delete manifest.devDependencies["oxlint-tsgolint"];
    manifest.devDependencies.oxlint = "1.94.0";
    manifest.devDependencies.tsrs = "0.25.0-ts7.1.0-beta";
    manifest.devDependencies.typescript = "7.0.2";
    manifest.dependencies.effect = major === 4 ? "4.0.0" : "3.22.1";
  }
  await writeFile(join(root, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  if (major === 4) {
    const configPath = join(root, "tsconfig.json");
    const tsconfig = JSON.parse(await readFile(configPath, "utf8"));
    tsconfig.include.push(config);
    tsconfig.compilerOptions.allowImportingTsExtensions = true;
    tsconfig.compilerOptions.lib = ["ES2022", "DOM", "DOM.Iterable", "ESNext.Disposable"];
    await writeFile(configPath, `${JSON.stringify(tsconfig, null, 2)}\n`);
  }

  assertSuccess(run("bun", ["install", "--ignore-scripts"], root), "bun install");
  assertSuccess(run("bun", ["run", "typecheck"], root), "bun run typecheck");

  // An explicit local launcher keeps an opted-in test from silently using Go.
  const env = { ...process.env };
  if (process.platform !== "win32") {
    const launcher = join(root, "node_modules", ".bin", useTsrs ? "tsrs-lint" : "tsgolint");
    await access(launcher);
    env.OXLINT_TSGOLINT_PATH = launcher;
  }
  const lint = (target: string) => run("bun", ["run", "oxlint", "--config", config, "--format", "json", target], root, env);
  const expected = await expectedRuleIds(join(root, "src"));
  assertExpectedDiagnostics(lint("src"), expected);
  assertExpectedDiagnostics(lint("src/valid-controls.ts"), []);
  console.log(`Effect ${major} with ${useTsrs ? "tsrs" : "tsgolint"}: typecheck, ${expected.length} expected lint diagnostics, and clean control passed`);
}

try {
  packRoot = await mkdtemp(join(tmpdir(), "oxlint-effect-pack-"));
  npmCacheRoot = await mkdtemp(join(tmpdir(), "oxlint-effect-npm-cache-"));
  consumerTempRoot = await mkdtemp(join(tmpdir(), "oxlint-effect-type-aware-consumer-"));

  const packResult = run(
    "npm",
    ["pack", "--json", "--pack-destination", packRoot],
    repoRoot,
  );
  if (packResult.status !== 0) {
    throw new Error(`npm pack failed:\n${packResult.output}`);
  }
  let filename: string;
  try {
    [{ filename }] = JSON.parse(packResult.stdout) as Array<{ filename: string }>;
  } catch (error) {
    throw new Error(
      `npm pack returned invalid JSON:\nstdout:\n${packResult.stdout}\nstderr:\n${packResult.stderr}`,
      { cause: error },
    );
  }
  const tarball = join(packRoot, filename);

  const majors = useTsrs ? [3, 4] as const : [3] as const;
  for (const major of majors) {
    await verifyConsumer(join(consumerTempRoot, `effect${major}`), tarball, major);
  }
} finally {
  await Promise.all(
    [packRoot, npmCacheRoot, consumerTempRoot]
      .filter((directory): directory is string => directory !== undefined)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
}
