import { Effect } from "effect";
// linteffect/no-new-date-in-domain-logic: all Date construction, not just ambient reads.
export const ambient = new Date();
export const epoch = new Date(0);
export const literal = new Date("2026-01-01T00:00:00Z");
export function conversion(input: number) { return new Date(input); }
export const sync = Effect.sync(() => new Date());
export const gen = Effect.gen(function* () { return new Date(); });
export const unused = () => new Date();
// Syntax policy also reports an unrelated local constructor named Date.
export function shadowed() { class Date { readonly value = 42; } return new Date(); }
