import { Context, Effect } from "effect";
// Removed APIs are checked compiler-negative migration examples, never executed.
export function legacyTags() {
  // linteffect/prefer-effect-service; @ts-expect-error is on the next line to prove removal.
  // @ts-expect-error Context.Tag was removed in Effect 4.
  Context.Tag("Legacy");
  // linteffect/prefer-effect-service
  // @ts-expect-error Context.GenericTag was removed in Effect 4.
  Context.GenericTag("Legacy");
  // linteffect/prefer-effect-service
  // @ts-expect-error Effect.Service was removed in Effect 4.
  Effect.Service();
}
