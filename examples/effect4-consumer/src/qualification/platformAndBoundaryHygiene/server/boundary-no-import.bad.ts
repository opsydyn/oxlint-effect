// @lint-expect linteffect/no-boundary-try-catch-without-effect-map: no Effect import gate.
export function rawBoundary() { try { throw new Error("raw"); } catch { return 42; } }
