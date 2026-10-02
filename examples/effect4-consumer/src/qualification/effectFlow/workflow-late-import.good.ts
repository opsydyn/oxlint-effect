// Import-order gap, not a semantic repair.
export const source = Effect.succeed(1).pipe(Effect.flatMap(n => Effect.succeed(n + 1)), Effect.flatMap(n => Effect.succeed(n + 1)), Effect.flatMap(n => Effect.succeed(n + 39)));
import { Effect } from "effect";
