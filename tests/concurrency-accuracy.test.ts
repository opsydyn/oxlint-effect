import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const rules = ["no-race-without-cleanup", "no-shared-mutable-state-across-fibers", "no-global-mutable-concurrency-state"];

function inspect(source: string, version: 3 | 4) {
  const dir = mkdtempSync(join(tmpdir(), "oxlint-concurrency-accuracy-"));
  try {
    const file = join(dir, "case.ts");
    const config = join(dir, "oxlint.json");
    writeFileSync(file, source);
    writeFileSync(config, JSON.stringify({
      categories: { correctness: "off" },
      jsPlugins: [{ name: "linteffect", specifier: join(root, "src/index.ts") }],
      rules: Object.fromEntries(rules.map(id => [`linteffect/${id}`, ["error", { effectVersion: version }]])),
    }));
    const result = spawnSync(join(root, "node_modules/.bin/oxlint"), ["--format", "json", "--config", config, file], { cwd: root, encoding: "utf8" });
    const parsed = JSON.parse(result.stdout);
    expect(result.status).toBe(parsed.diagnostics.length ? 1 : 0);
    return parsed.diagnostics.map((entry: { code: string }) => entry.code).sort();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const stateWarnings = ["linteffect(no-global-mutable-concurrency-state)", "linteffect(no-shared-mutable-state-across-fibers)"];
const raceWarning = ["linteffect(no-race-without-cleanup)"];

describe("concurrency accuracy through real Oxlint scopes", () => {
  for (const version of [3, 4] as const) {
    const fork = version === 3 ? "fork" : "forkChild";
    it(`v${version}: pure and opaque races need no redundant cleanup`, () => {
      expect(inspect('import { Effect } from "effect"; Effect.race(Effect.succeed(42), Effect.never); const run = (a, b) => Effect.race(a, b);', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; class FileError extends Error {} Effect.race(Effect.fail(new FileError()), Effect.succeed(42));', version)).toEqual([]);
    });
    it(`v${version}: only the resource-owning branch's cleanup counts`, () => {
      expect(inspect('import { Effect } from "effect"; Effect.race(Effect.succeed(42), Effect.sync(() => openFile()));', version)).toEqual(raceWarning);
      expect(inspect('import { Effect } from "effect"; Effect.race(Effect.sync(() => new Client()), Effect.never);', version)).toEqual(raceWarning);
      expect(inspect('import { Effect } from "effect"; Effect.race(Effect.succeed(42).pipe(Effect.ensuring(Effect.void)), Effect.sync(() => openFile()));', version)).toEqual(raceWarning);
      expect(inspect('import { Effect } from "effect"; Effect.race(Effect.succeed(42), Effect.sync(() => openFile()).pipe(Effect.ensuring(closeFile)));', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; const Fx = { ensuring: x => x }; Effect.race(Effect.succeed(42), Effect.sync(() => openFile()).pipe(Fx.ensuring(closeFile)));', version)).toEqual(raceWarning);
      expect(inspect('import { Effect } from "effect"; Effect.race(Effect.succeed(() => openFile()), Effect.never);', version)).toEqual([]);
    });
    it(`v${version}: sequential and unknown collection budgets remain clean`, () => {
      for (const options of ["", ", { concurrency: 1 }", ", { concurrency: 2, ...options }", ", { concurrency: budget }", ", { concurrency: 2, [key]: 1 }"]) {
        expect(inspect(`import { Effect } from "effect"; let count = 0; Effect.forEach([1, 2], () => Effect.sync(() => count++)${options});`, version)).toEqual([]);
      }
      expect(inspect('import { Effect } from "effect"; let count = 0; Effect.all([Effect.sync(() => count++)], { concurrency: 2, concurrency: 1 });', version)).toEqual([]);
    });
    it(`v${version}: explicit parallelism and forks retain shared-state warnings`, () => {
      for (const budget of ["2", '"unbounded"', "Infinity"]) {
        expect(inspect(`import { Effect } from "effect"; let count = 0; Effect.forEach([1, 2], () => Effect.sync(() => count++), { concurrency: ${budget} });`, version)).toEqual(stateWarnings);
      }
      expect(inspect(`import { Effect } from "effect"; let count = 0; Effect.${fork}(Effect.sync(() => count++));`, version)).toEqual(stateWarnings);
    });
    it(`v${version}: imports, namespaces, subpaths and data-last APIs resolve by binding`, () => {
      for (const [imports, api] of [
        ['import { Effect as Fx } from "effect";', "Fx"],
        ['import * as Fx from "effect/Effect";', "Fx"],
        ['import * as P from "effect";', "P.Effect"],
      ]) {
        expect(inspect(`${imports} let count = 0; ${api}.forEach([1, 2], () => ${api}.sync(() => count++), { concurrency: 2 });`, version)).toEqual(stateWarnings);
        expect(inspect(`${imports} ${api}.race(${api}.succeed(42), ${api}.sync(() => openFile()));`, version)).toEqual(raceWarning);
      }
      expect(inspect('import { forEach as each, sync } from "effect/Effect"; import { pipe as chain } from "effect"; let count = 0; chain([1, 2], each(() => sync(() => count++), { concurrency: 2 }));', version)).toEqual(stateWarnings);
      expect(inspect('import { race as compete, sync, succeed } from "effect/Effect"; compete(sync(() => openFile()))(succeed(42));', version)).toEqual(raceWarning);
    });
    it(`v${version}: shadowed APIs and worker-local bindings are clean`, () => {
      expect(inspect('import { Effect } from "effect"; let count = 0; function f(Effect) { Effect.forEach([1, 2], () => count++, { concurrency: 2 }); Effect.race(openFile(), other); }', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; let count = 0; Effect.forEach([1, 2], count => Effect.sync(() => count++), { concurrency: 2 });', version)).toEqual([]);
      expect(inspect('import type { Effect } from "effect"; let count = 0; Effect.forEach([1, 2], () => count++, { concurrency: 2 });', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; let count = 0; Effect.forEach([1, 2], () => Effect.succeed(() => count++), { concurrency: 2 });', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; const run = () => { let count = 0; return Effect.forEach([1, 2], () => Effect.sync(() => count++), { concurrency: 2 }); };', version)).toEqual(["linteffect(no-shared-mutable-state-across-fibers)"]);
    });
    it(`v${version}: const containers and hoisted value imports retain warnings`, () => {
      expect(inspect('const values = []; Effect.forEach([1, 2], value => Effect.sync(() => values.push(value)), { concurrency: 2 }); import { Effect } from "effect";', version)).toEqual(stateWarnings);
      expect(inspect('Effect.race(Effect.succeed(42), Effect.sync(() => openFile())); import { Effect } from "effect";', version)).toEqual(raceWarning);
    });
  }
});
