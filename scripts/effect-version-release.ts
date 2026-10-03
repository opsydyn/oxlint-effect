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

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function evidence(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every(path => typeof path === "string" && path.trim().length > 0);
}

export function assertEffectGroupReleaseReady(groups: unknown, exportedGroupNames: readonly string[]): void {
  if (!record(groups) || JSON.stringify(Object.keys(groups).sort()) !== JSON.stringify([...exportedGroupNames].sort())) throw new Error("Effect groups must exactly cover exported groups");
  for (const [name, row] of Object.entries(groups)) {
    if (!record(row) || !record(row.members) || Object.keys(row.members).length === 0) throw new Error(`${name}: missing group members`);
    for (const major of [3, 4]) {
      if (!record(row.applicability) || !record(row.qualification) || row.applicability[major] !== true || row.qualification[major] !== "qualified") throw new Error(`${name}: group not qualified for Effect ${major}`);
      if (!record(row.configEvidence) || !record(row.skillEvidence) || !evidence(row.configEvidence[major]) || !evidence(row.skillEvidence[major])) throw new Error(`${name}: missing config/skill evidence for Effect ${major}`);
      for (const [id, member] of Object.entries(row.members)) {
        if (!record(member) || !record(member.applicability) || !record(member.qualification) || !record(member.classification) || !record(member.evidence)) throw new Error(`${name}/${id}: malformed member`);
        const applicable = member.applicability[major];
        if (applicable === true) {
          if (member.qualification[major] !== "qualified" || !(major === 3 ? ["unchanged", "adapted", "legacy-only"] : ["unchanged", "adapted"]).includes(String(member.classification[major])) || !evidence(member.evidence[major])) throw new Error(`${name}/${id}: member not qualified for Effect ${major}`);
        } else if (applicable !== false || member.qualification[major] !== "not-applicable" || member.classification[major] !== "legacy-only") throw new Error(`${name}/${id}: invalid inapplicable member for Effect ${major}`);
      }
    }
  }
}
