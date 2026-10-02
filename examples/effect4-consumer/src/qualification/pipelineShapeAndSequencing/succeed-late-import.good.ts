const value = 42;
export const task = Effect.succeed(value);
// Preserved import-order gap.
import { Effect } from "effect";
