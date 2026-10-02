import { Effect } from "effect";
// linteffect/no-adhoc-domain-error: direct literal failure and thrown Error.
export const first = Effect.fail("Denied");
export const second = Effect.fail("Conflict");
export function throwFirst() { throw new Error("Denied"); }
export const throwSecond = () => { throw new Error("Conflict"); };
