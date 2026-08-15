import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

type CommandResult = {
  status: number;
  stdout: string;
  stderr: string;
  output: string;
};

const expectationPattern = /\/\/ EXPECT: (linteffect|typescript)\/([a-z]+(?:-[a-z]+)*)/g;
const observedRulePattern = /(linteffect|typescript)\(([a-z]+(?:-[a-z]+)*)\)/g;

function run(command: string, args: string[], cwd: string): CommandResult {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: command === "npm"
      ? { ...process.env, npm_config_cache: npmCacheRoot, npm_config_ignore_scripts: "true" }
      : process.env,
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

async function expectedRuleIds(root: string): Promise<Set<string>> {
  const expected = new Set<string>();
  const files = await sourceFiles(root);

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(expectationPattern)) {
      expected.add(`${match[1]}/${match[2]}`);
    }
  }

  return expected;
}

function observedRuleIds(output: string): Set<string> {
  return new Set(
    [...output.matchAll(observedRulePattern)].map((match) => `${match[1]}/${match[2]}`),
  );
}

function assertExpectedDiagnostics(result: CommandResult, expected: Set<string>): void {
  if (result.status !== 1) {
    throw new Error(`Expected lint to exit 1, received ${result.status}:\n${result.output}`);
  }

  const observed = observedRuleIds(result.output);
  const missing = [...expected].filter((ruleId) => !observed.has(ruleId)).sort();
  const unexpected = [...observed].filter((ruleId) => !expected.has(ruleId)).sort();

  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `Unexpected lint diagnostics:\nmissing: ${missing.join(", ") || "none"}\nunexpected: ${unexpected.join(", ") || "none"}\n${result.output}`,
    );
  }
}

function assertSuccess(result: CommandResult, command: string): void {
  if (result.status !== 0) {
    throw new Error(`${command} failed:\n${result.output}`);
  }
}

const repoRoot = resolve(import.meta.dir, "..");
let packRoot: string | undefined;
let npmCacheRoot: string | undefined;
let consumerTempRoot: string | undefined;

try {
  packRoot = await mkdtemp(join(tmpdir(), "oxlint-effect-pack-"));
  npmCacheRoot = await mkdtemp(join(tmpdir(), "oxlint-effect-npm-cache-"));
  consumerTempRoot = await mkdtemp(join(tmpdir(), "oxlint-effect-type-aware-consumer-"));
  const consumerRoot = join(consumerTempRoot, "consumer");

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

  await cp(join(repoRoot, "examples/type-aware-consumer"), consumerRoot, { recursive: true });
  await unlink(join(consumerRoot, "bun.lock"));

  const packagePath = join(consumerRoot, "package.json");
  const consumerPackage = JSON.parse(await readFile(packagePath, "utf8")) as {
    dependencies: Record<string, string>;
  };
  consumerPackage.dependencies["@opsydyn/oxlint-effect"] = `file:${tarball}`;
  await writeFile(packagePath, `${JSON.stringify(consumerPackage, null, 2)}\n`);

  assertSuccess(run("bun", ["install"], consumerRoot), "bun install");
  assertSuccess(run("bun", ["run", "typecheck"], consumerRoot), "bun run typecheck");

  const expected = await expectedRuleIds(join(consumerRoot, "src"));
  assertExpectedDiagnostics(run("bun", ["run", "lint"], consumerRoot), expected);

  const validControl = run("bun", ["run", "lint:valid"], consumerRoot);
  assertSuccess(validControl, "bun run lint:valid");
  if (validControl.output.includes("linteffect(") || validControl.output.includes("typescript(")) {
    throw new Error(`Valid control reported a type-aware diagnostic:\n${validControl.output}`);
  }
} finally {
  await Promise.all(
    [packRoot, npmCacheRoot, consumerTempRoot]
      .filter((directory): directory is string => directory !== undefined)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
}
