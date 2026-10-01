import { Effect } from "effect";

export function boundaryValue(): number {
  return Effect.runSync(Effect.succeed(1));
}
