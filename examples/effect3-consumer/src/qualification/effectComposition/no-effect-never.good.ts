import { Effect } from "effect";
export const events: string[] = [];
// CLEAN: finite scoped work with explicit teardown.
export const program = Effect.scoped(Effect.gen(function* () {
  const resource = yield* Effect.acquireRelease(Effect.sync(() => { events.push("acquire"); return "resource"; }), () => Effect.sync(() => { events.push("release"); }));
  return resource;
}));
const Other = { never: "ordinary" };
export const unrelated = Other.never;
