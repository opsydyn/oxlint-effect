import { Effect } from "effect";
// linteffect/no-return-null: explicit literal null returns after import.
export function absent() { return null; }
export const block = () => { return null; };
export function unused() { const never = () => { return null; }; return 42; }
export const task = Effect.gen(function*() { return null; });
export const mapped = [1].map(() => { return null; });
