import { Effect } from "effect";

export function hiddenValue(): number {
  // EXPECT: linteffect/no-hidden-effect-execution
  return Effect.runSync(Effect.succeed(1));
}
