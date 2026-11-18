import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { effect3, errorModelingRules, recommended, typeAware } from "../src/index";

const root = resolve(import.meta.dir, "..");
const id = "linteffect/no-error-cause-loss";
const warning = "linteffect(no-error-cause-loss)";

function inspect(source: string, version: 3 | 4, group = false) {
  const dir = mkdtempSync(join(tmpdir(), "oxlint-cause-loss-"));
  try {
    const file = join(dir, "case.ts");
    const config = join(dir, "oxlint.json");
    writeFileSync(file, source);
    writeFileSync(config, JSON.stringify({
      categories: { correctness: "off" },
      jsPlugins: [{ name: "linteffect", specifier: join(root, "src/index.ts") }],
      rules: group ? version === 3 ? effect3.errorModelingRules : errorModelingRules : { [id]: ["error", { effectVersion: version }] },
    }));
    const result = spawnSync(join(root, "node_modules/.bin/oxlint"), ["--format", "json", "--config", config, file], { cwd: root, encoding: "utf8" });
    const parsed = JSON.parse(result.stdout);
    expect(result.status).toBe(parsed.diagnostics.length ? 1 : 0);
    return parsed.diagnostics.map((entry: { code: string }) => entry.code).sort();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("opt-in cause-loss policy", () => {
  it("does not change recommended or type-aware recommended defaults", () => {
    for (const preset of [recommended, typeAware, effect3.recommended, effect3.typeAware]) expect(preset.rules).not.toHaveProperty(id);
  });
  for (const version of [3, 4] as const) {
    const recover = version === 3 ? "catchAll" : "catch";
    const recoverCause = version === 3 ? "catchAllCause" : "catchCause";
    it(`v${version}: the explicit error group diagnoses a visibly erased original`, () => {
      expect(inspect('import { Effect } from "effect"; Effect.mapError(task, error => new Wrapped({ message: error.message }));', version, true)).toEqual([warning]);
    });
    it(`v${version}: maps and typed/cause recovery check their actual outgoing constructor`, () => {
      for (const source of [
        'Effect.mapError(task, () => new Wrapped());',
        'Effect.mapError(task, error => new Wrapped({ code: -1 }));',
        'Effect.mapError(task, error => new Wrapped({ message: error.message }));',
        `Effect.${recover}(task, error => Effect.fail(new Wrapped({ cause: undefined })));`,
        `task.pipe(Effect.${recoverCause}(cause => Effect.fail(new Wrapped({ detail: "lost" }))));`,
        'Effect.mapError(task, error => { if (condition) return new Wrapped(); return new Other({ cause: null }); });',
      ]) {
        const expected = source.includes("new Other") ? [warning, warning] : [warning];
        expect(inspect('import { Effect } from "effect"; ' + source, version)).toEqual(expected);
      }
    });
    it(`v${version}: passes the original without imposing a field name`, () => {
      for (const expression of ['new Wrapped(error)', 'new Wrapped({ cause: error })', 'new Wrapped({ original: error })', 'new Wrapped({ context: { original: error } })', 'new Wrapped([error])']) {
        expect(inspect(`import { Effect } from "effect"; Effect.mapError(task, error => ${expression});`, version)).toEqual([]);
      }
      expect(inspect(`import { Effect } from "effect"; Effect.${recoverCause}(task, cause => Effect.fail(new Wrapped({ cause })));`, version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; Effect.mapError(task, error => new Wrapped({ cause: (error as unknown) }));', version)).toEqual([]);
    });
    it(`v${version}: effective property order matters; opaque input is unknown`, () => {
      expect(inspect('import { Effect } from "effect"; Effect.mapError(task, error => new Wrapped({ cause: error, cause: null }));', version)).toEqual([warning]);
      for (const expression of [
        'new Wrapped({ cause: null, cause: error })',
        'new Wrapped({ ...options, cause: error })',
        'new Wrapped({ cause: error, ...options })',
        'new Wrapped({ cause: alias })',
        'new Wrapped({ cause: keep(error) })',
        'new Wrapped({ [key]: error })',
        'Wrapped.make({ message: error.message })',
      ]) expect(inspect(`import { Effect } from "effect"; Effect.mapError(task, error => ${expression});`, version)).toEqual([]);
    });
    it(`v${version}: aliases resolve but shadows and unused callbacks do not`, () => {
      expect(inspect('import { Effect as Fx } from "effect"; Fx.mapError(task, error => new Wrapped());', version)).toEqual([warning]);
      expect(inspect('import { mapError as map } from "effect/Effect"; map(error => new Wrapped())(task);', version)).toEqual([warning]);
      expect(inspect('import * as Fx from "effect/Effect"; Fx.mapError(task, error => new Wrapped());', version)).toEqual([warning]);
      expect(inspect('import { Effect } from "effect"; function f(Effect) { return Effect.mapError(task, error => new Wrapped()); }', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; Effect.mapError(task, error => { const unused = () => new Wrapped(); return error; });', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; Effect.mapError(task, handler);', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; Effect.mapError(task, ({ message }) => new Wrapped({ message }));', version)).toEqual([]);
      expect(inspect('import type { Effect } from "effect"; Effect.mapError(task, error => new Wrapped());', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; function f(undefined) { return Effect.mapError(task, error => new Wrapped({ cause: undefined })); }', version)).toEqual([]);
    });
    it(`v${version}: logging is not a bypass and input reassignment is unknown`, () => {
      expect(inspect('import { Effect } from "effect"; task.pipe(Effect.tapError(Effect.logError), Effect.mapError(error => new Wrapped()));', version)).toEqual([warning]);
      expect(inspect('import { Effect } from "effect"; Effect.mapError(task, error => { error = other; return new Wrapped({ cause: error }); });', version)).toEqual([]);
      expect(inspect('import { Effect } from "effect"; Effect.mapError(task, error => flag ? new Wrapped() : error);', version)).toEqual([warning]);
    });
    it(`v${version}: only supported own-major spellings are checked`, () => {
      const source = 'import { Effect } from "effect"; Effect.mapErrorEager(task, error => new Wrapped()); Effect.catchEager(task, error => Effect.fail(new Wrapped())); Effect.catchAll(task, error => Effect.fail(new Wrapped()));';
      expect(inspect(source, version)).toEqual(version === 4 ? [warning, warning] : [warning]);
    });
  }
});
