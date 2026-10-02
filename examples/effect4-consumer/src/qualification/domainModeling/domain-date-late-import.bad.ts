// Deferred Date collection deliberately recognises declarations before import.
export const ambient = new Date();
export const explicit = new Date(0);
import { Effect } from "effect";
export const task = Effect.succeed(42);
