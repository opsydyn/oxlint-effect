import { Effect } from "effect";

export function entryValue(): number {
  // EXPECT: linteffect/no-hidden-effect-execution
  return Effect.runSync(Effect.succeed(1));
}
