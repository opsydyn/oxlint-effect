import { Context, Effect } from "effect";
export const DatabaseService = Context.Service<{ readonly value: number }>("Database");
export function removedDefinition() {
  // @ts-expect-error Effect.Service and its dependency options are removed in v4.
  class Legacy extends Effect.Service<Legacy>()("Legacy", { effect: Effect.gen(function* () { return yield* DatabaseService; }) }) {}
  return Legacy;
}
export class Current extends Context.Service<Current>()("Current", { make: Effect.gen(function* () { return yield* DatabaseService; }) }) {}
export function unsupportedOptions() {
  // @ts-expect-error Context.Service does not accept legacy dependencies.
  return Context.Service<{ readonly id: string }, { readonly value: number }>()("Unsupported", { dependencies: [] });
}
