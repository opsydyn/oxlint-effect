import { Effect } from "effect";

export function entryValue(): number {
  return Effect.runSync(Effect.succeed(1));
}
