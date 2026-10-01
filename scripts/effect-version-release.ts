export function assertEffectVersionReleaseReady(ruleNames: readonly string[], inventory: Record<string, unknown>, packageVersion: string): void {
  if (!/^(?:[2-9]|[1-9]\d+)\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageVersion)) {
    throw new Error("Effect 4 defaults require a reviewed major release (2.0.0 or later)");
  }
  if (JSON.stringify([...ruleNames].sort()) !== JSON.stringify(Object.keys(inventory).sort())) {
    throw new Error("Effect version inventory must exactly cover registered rules");
  }
  const unqualified: string[] = [];
  for (const name of ruleNames) {
    const row = inventory[name] as { applicability?: Record<string, unknown>; qualification?: Record<string, unknown> } | null;
    for (const major of [3, 4]) {
      const applicable = row?.applicability?.[major];
      const qualification = row?.qualification?.[major];
      if (applicable === true ? qualification !== "qualified" : applicable !== false || qualification !== "not-applicable") {
        unqualified.push(`${name} (Effect ${major})`);
      }
    }
  }
  if (unqualified.length) throw new Error(`Effect rules not qualified for release: ${unqualified.join(", ")}`);
}
