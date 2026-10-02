import { Effect } from "effect";
export function repaired(events: string[], failure?: object) {
  const workflow = Effect.gen(function*() {
    const n = yield* Effect.sync(() => { events.push("first"); return 1; });
    return yield* (failure ? Effect.fail(failure) : Effect.sync(() => { events.push("second"); return n + 41; }));
  });
  return workflow.pipe(Effect.catch(() => Effect.sync(() => { events.push("fallback"); return 42; })));
}
