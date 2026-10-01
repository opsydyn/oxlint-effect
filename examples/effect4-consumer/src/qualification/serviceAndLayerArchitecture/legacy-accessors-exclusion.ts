import { Context, Effect } from "effect";
// Compiler-negative migration probe, never executed. Manual v4 policy must not
// prescribe accessors even on a parsed legacy class.
export function removedDefinition() {
  // @ts-expect-error Effect.Service was removed in Effect 4.
  class Legacy extends Effect.Service<Legacy>()("Legacy", { sync: () => ({ value: 42 }) }) {}
  return Legacy;
}
export const Key = Context.Service<{ readonly value: number }>("KeyWithoutAccessors");
export function unsupportedOptions() {
  // @ts-expect-error Context.Service does not support legacy accessor options.
  return Context.Service<{ readonly id: string }, { readonly value: number }>()("Unsupported", { accessors: true });
}
