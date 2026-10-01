import { resolve } from "node:path";
import plugin from "../src/index.ts";
import { assertEffectVersionReleaseReady } from "./effect-version-release.ts";

const root = resolve(import.meta.dir, "..");
const inventory = await Bun.file(resolve(root, "docs/effect-version-inventory.json")).json();
const { version } = await Bun.file(resolve(root, "package.json")).json();
assertEffectVersionReleaseReady(Object.keys(plugin.rules), inventory, version);
console.log("Effect version release inventory is fully qualified");
