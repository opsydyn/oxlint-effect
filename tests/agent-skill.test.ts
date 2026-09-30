import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import path from "node:path";
import ts from "typescript";
import { Effect } from "effect";
import plugin, * as exports from "../src/index";
import { decodeInvoiceId, decodeUserId, rejectTransfer, settleInvoice, TransferRejected } from "../skills/oxlint-effect/assets/domain.good";

const root = path.resolve(import.meta.dir, "..");
const skillRoot = "skills/oxlint-effect";
const skillFiles = [
  `${skillRoot}/SKILL.md`,
  `${skillRoot}/references/configuration.md`,
  `${skillRoot}/references/domain-modeling.md`,
  `${skillRoot}/assets/domain.bad.ts`,
  `${skillRoot}/assets/domain.good.ts`,
];

describe("agent skill contract", () => {
  it("ships a self-contained skill with valid rule and preset references", async () => {
    for (const file of skillFiles) {
      expect(await Bun.file(file).exists()).toBe(true);
      const text = await Bun.file(file).text();
      for (const match of text.matchAll(/linteffect\/([a-z0-9-]+)/g)) {
        expect(plugin.rules).toHaveProperty(match[1]!);
      }
      if (!file.endsWith(".md")) continue;
      for (const match of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
        const target = match[1]!;
        if (/^https?:/.test(target)) continue;
        expect(await Bun.file(path.resolve(path.dirname(file), target)).exists()).toBe(true);
      }
      for (const match of text.matchAll(/```ts\n([\s\S]*?)```/g)) {
        const source = ts.createSourceFile("snippet.ts", match[1]!, ts.ScriptTarget.Latest);
        for (const statement of source.statements) {
          if (!ts.isImportDeclaration(statement)
            || !ts.isStringLiteral(statement.moduleSpecifier)
            || statement.moduleSpecifier.text !== "@opsydyn/oxlint-effect") continue;
          const bindings = statement.importClause?.namedBindings;
          if (!bindings || !ts.isNamedImports(bindings)) continue;
          for (const specifier of bindings.elements) {
            expect(exports).toHaveProperty((specifier.propertyName ?? specifier.name).text);
          }
        }
      }
    }
    const entry = await Bun.file(`${skillRoot}/SKILL.md`).text();
    expect(entry).toMatch(/^---\nname: oxlint-effect\ndescription: .+\n---/);
  });

  it("packs the skill, its references, and both example controls", () => {
    const packed = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      cwd: root, encoding: "utf8",
    });
    expect(packed.status).toBe(0);
    const result = JSON.parse(packed.stdout) as Array<{ files: Array<{ path: string }> }>;
    const paths = result[0]!.files.map((file) => file.path);
    for (const file of skillFiles) expect(paths).toContain(file);
  });

  it("reports every annotated failure and leaves the DDD repair clean", async () => {
    const badPath = `${skillRoot}/assets/domain.bad.ts`;
    const bad = await Bun.file(badPath).text();
    const expected = [...bad.matchAll(/EXPECT: linteffect\/([a-z0-9-]+)/g)]
      .map((match) => match[1]!).sort();
    expect(expected).toHaveLength(3);
    for (const file of [badPath, `${skillRoot}/assets/domain.good.ts`]) {
      const result = spawnSync(path.join(root, "node_modules/.bin/oxlint"), [
        "--config", "tests/fixtures/oxlint/oxlint.agent-skill.config.ts", file,
      ], { cwd: root, encoding: "utf8" });
      const observed = [...`${result.stdout}${result.stderr}`.matchAll(/linteffect\(([^)]+)\)/g)]
        .map((match) => match[1]!).sort();
      expect(result.status).toBe(file === badPath ? 1 : 0);
      expect(observed).toEqual(file === badPath ? expected : []);
    }
  });

  it("typechecks the failure examples and repaired domain contracts", () => {
    const result = spawnSync(path.join(root, "node_modules/.bin/tsc"), [
      "--noEmit", "--strict", "--skipLibCheck", "--target", "ES2022",
      "--module", "ESNext", "--moduleResolution", "Bundler",
      `${skillRoot}/assets/domain.bad.ts`, `${skillRoot}/assets/domain.good.ts`,
    ], { cwd: root, encoding: "utf8" });
    expect(`${result.stdout}${result.stderr}`).toBe("");
    expect(result.status).toBe(0);
  });

  it("preserves both notification payloads and exposes structured failure context", () => {
    const invoiceId = decodeInvoiceId("invoice-1");
    expect(settleInvoice(invoiceId, "Notify")).toEqual({ invoiceId, shouldNotifyCustomer: true });
    expect(settleInvoice(invoiceId, "Silent")).toEqual({ invoiceId, shouldNotifyCustomer: false });
    expect(() => decodeUserId(123)).toThrow();
    expect(() => decodeUserId("")).toThrow();
    const userId = decodeUserId("user-1");
    const failure = Effect.runSync(Effect.flip(rejectTransfer(userId)));
    expect(failure).toBeInstanceOf(TransferRejected);
    expect(failure._tag).toBe("TransferRejected");
    expect(failure.userId).toBe(userId);
    expect(failure.reason).toBe("not allowed");
  });
});
