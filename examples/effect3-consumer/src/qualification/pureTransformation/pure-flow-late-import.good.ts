// Import-order gap, not proof of a pure boundary.
export const late = flow((n: number) => Effect.succeed(n));
export const long = flow((n: number) => n, n => n, n => n, n => n, n => n);
import { Effect, flow } from "effect";
