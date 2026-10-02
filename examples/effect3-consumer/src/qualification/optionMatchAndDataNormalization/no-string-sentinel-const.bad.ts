// linteffect/no-string-sentinel-const has no import gate; all literal initialisers.
export const status = "ready";
export let state = "pending";
export var label = "A legitimate display value";
export const empty = "";
export const first = "ready", second = "pending";
export function local() { const label = "local display"; return label; }
