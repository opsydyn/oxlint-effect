// Import-order gaps, not repairs.
export const overlay = { count: 42 } as { readonly count: number };
export const check = (input: unknown) => typeof input === "boolean";
import { Schema } from "effect";
export const decoder = Schema.Boolean;
