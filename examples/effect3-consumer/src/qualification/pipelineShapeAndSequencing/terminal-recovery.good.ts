import { Effect } from "effect";
export function repaired(events: string[], failure?: object) {
  const workflow = Effect.gen(function*() {
    const n = yield* Effect.sync(() => { events.push("first"); return 1; });
    return yield* (failure ? Effect.fail(failure) : Effect.sync(() => { events.push("second"); return n + 41; }));
  });
  return workflow.pipe(Effect.orElse(() => Effect.sync(() => { events.push("fallback"); return 42; })));
}
const first = Effect.succeed(42);
// Stored/aliased sequencing is opaque; shallow recovery stays clean.
export const shallow = Effect.orElse(first, () => first);
const sequence = Effect.flatMap(first, n => Effect.succeed(n));
export const named = Effect.orElse(sequence, () => first);
