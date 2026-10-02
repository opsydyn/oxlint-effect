import { value } from "./lazy-value";
// TS import types are not runtime dynamic imports.
export type Module = typeof import("./lazy-value");
export const direct = () => value;
export const task = () => Promise.resolve(value);
