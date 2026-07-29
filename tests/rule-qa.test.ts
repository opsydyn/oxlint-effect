import { describe, expect, it } from "bun:test";
import plugin from "../src/index";

type RuleQaInventory = Record<string, string>;

const ruleIdPattern = /linteffect\/([A-Za-z0-9-]+)/g;
const expectationPattern = /\/\/ EXPECT: linteffect\/([A-Za-z0-9-]+)/g;

const uniqueSorted = (values: Iterable<string>): string[] => [...new Set(values)].sort();

const extractRuleIds = (text: string, pattern: RegExp): string[] =>
  [...text.matchAll(pattern)].map((match) => match[1]!);

const readGlob = async (pattern: string): Promise<Map<string, string>> => {
  const paths = await Array.fromAsync(new Bun.Glob(pattern).scan("."));
  const entries = await Promise.all(paths.map(async (path) => [path, await Bun.file(path).text()] as const));
  return new Map(entries);
};

const readInventory = async (): Promise<RuleQaInventory> => {
  const file = Bun.file("docs/rule-qa-inventory.json");
  return await file.exists() ? file.json() as Promise<RuleQaInventory> : {};
};

const exportedRuleIds = uniqueSorted(Object.keys(plugin.rules));
const inventory = await readInventory();
const readme = await Bun.file("README.md").text();
const examples = await readGlob("examples/**/*.ts");
const roadmaps = await readGlob("roadmap/*/README.md");
const exampleRuleIds = uniqueSorted(
  [...examples.values()].flatMap((source) => extractRuleIds(source, expectationPattern)),
);

describe("rule QA inventory", () => {
  it("covers every exported rule exactly once", () => {
    expect(uniqueSorted(Object.keys(inventory))).toEqual(exportedRuleIds);
  });

  it("requires a README entry and annotated example for every exported rule", () => {
    const missingReadmeEntries = exportedRuleIds.filter(
      (ruleId) => !readme.includes(`| \`linteffect/${ruleId}\` |`),
    );
    const missingExampleEntries = exportedRuleIds.filter(
      (ruleId) => !exampleRuleIds.includes(ruleId),
    );

    expect(missingReadmeEntries).toEqual([]);
    expect(missingExampleEntries).toEqual([]);
  });

  it("links roadmap-owned rules to completed roadmap entries", () => {
    const invalidOwners = Object.entries(inventory)
      .filter(([, owner]) => owner !== "legacy/parity")
      .flatMap(([ruleId, owner]) => {
        const roadmap = roadmaps.get(owner);
        if (roadmap === undefined) {
          return [`${ruleId}: missing ${owner}`];
        }

        return roadmap.includes(`| [x] | \`linteffect/${ruleId}\` |`)
          ? []
          : [`${ruleId}: incomplete ${owner}`];
      });

    expect(invalidOwners).toEqual([]);
  });
});
