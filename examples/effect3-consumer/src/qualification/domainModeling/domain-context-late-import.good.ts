// Declaration gating misses context function before import.
export function getAdminUser(userId: string) { return userId; }
import { Effect } from "effect";
export const task = Effect.succeed(42);
