export function rawShared() { try { throw new Error("raw"); } catch { return 42; } }
