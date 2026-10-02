export const task = Effect.sync(() => Math.abs(-42));
// Preserved import-order gap: warning gate has not yet seen this import.
import { Effect } from "effect";
