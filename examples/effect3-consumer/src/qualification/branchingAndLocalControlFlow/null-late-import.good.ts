export function absent() { return null; }
import { Effect } from "effect";
export const task = Effect.succeed(42);
