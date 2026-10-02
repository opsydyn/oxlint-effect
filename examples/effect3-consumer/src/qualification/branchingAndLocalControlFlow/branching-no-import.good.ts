// No ecosystem import: all three structural policies remain inactive.
export function before(enabled: boolean) { if (enabled) return 42; return 0; }
export function beforeSwitch(mode: "ready" | "waiting") { switch (mode) { case "ready": return 42; case "waiting": return 0; } }
export const beforeTernary = (enabled: boolean) => enabled ? 42 : 0;
