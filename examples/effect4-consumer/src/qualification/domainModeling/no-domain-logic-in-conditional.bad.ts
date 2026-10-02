import { Effect } from "effect";
// linteffect/no-domain-logic-in-conditional: three or more direct comparisons.
export const three = (a: number, b: number, c: number) => a > 0 && b > 0 && c > 0;
// Nested four-clause expression produces two reports: outer four and inner three.
export const four = (a: number, b: number, c: number, d: number) => a > 0 && b > 0 && c > 0 && d > 0;
// Naming alone is not a repair: the same body is still reported.
export function namedEligibility(a: number, b: number, c: number) { return a > 0 && b > 0 && c > 0; }
// Names and business meaning are not inspected.
export const ordinary = (x: number, y: number, z: number) => x === 1 || y !== 2 || z <= 3;
export const task = Effect.succeed(42);
