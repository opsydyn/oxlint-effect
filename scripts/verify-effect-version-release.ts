import { resolve } from "node:path";
import plugin, { ruleGroups, effect3 } from "../src/index.ts";
import { assertEffectGroupReleaseReady, assertEffectVersionReleaseReady } from "./effect-version-release.ts";

const root = resolve(import.meta.dir, "..");
const inventory = await Bun.file(resolve(root, "docs/effect-version-inventory.json")).json();
const { version } = await Bun.file(resolve(root, "package.json")).json();
assertEffectVersionReleaseReady(Object.keys(plugin.rules), inventory, version);
const groups = await Bun.file(resolve(root, "docs/effect-version-groups.json")).json();
assertEffectGroupReleaseReady(groups, Object.keys(ruleGroups));
for (const name of Object.keys(ruleGroups) as Array<keyof typeof ruleGroups>) {
  const expected = Object.keys({ ...effect3.ruleGroups[name], ...ruleGroups[name] }).map(id => id.slice("linteffect/".length)).sort();
  if (JSON.stringify(Object.keys(groups[name].members).sort()) !== JSON.stringify(expected)) throw new Error(`${name}: group membership differs from exported rules`);
  for (const [id, member] of Object.entries(groups[name].members) as Array<[string, { applicability: unknown; qualification: unknown; evidence: Record<string, string[]> }]>) {
    if (JSON.stringify(member.applicability) !== JSON.stringify(inventory[id].applicability) || JSON.stringify(member.qualification) !== JSON.stringify(inventory[id].qualification)) throw new Error(`${name}/${id}: group member disagrees with rule inventory`);
    for (const paths of Object.values(member.evidence)) for (const path of paths) if (!await Bun.file(resolve(root, path.split(":")[0]!)).exists()) throw new Error(`Missing member evidence: ${path}`);
  }
  for (const field of ["configEvidence", "skillEvidence"]) for (const paths of Object.values(groups[name][field]) as string[][]) for (const path of paths) if (!await Bun.file(resolve(root, path)).exists()) throw new Error(`Missing group evidence: ${path}`);
}
console.log("Effect version rule and group inventories are fully qualified");
