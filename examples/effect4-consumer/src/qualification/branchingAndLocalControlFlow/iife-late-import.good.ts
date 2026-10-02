export const value = (() => (() => 42)())();
// Existing order-sensitive gate has not yet seen the import.
import { Effect } from "effect";
export const task = Effect.succeed(42);
