import { Schema } from "effect";
interface Model { readonly count: number }
// linteffect/no-model-overlay-cast: variable declaration assertions, not only models.
export const direct = { count: 42 } as Model;
export const drift = { count: "wrong" } as unknown as Model;
export const ordinary = 1 as number;
export const first = 1 as number, second = 2 as number;
export const decoder = Schema.Number;
// Legacy parser-shape false positive is preserved; current policy exempts as const.
export const literal = { count: 42 } as const;
