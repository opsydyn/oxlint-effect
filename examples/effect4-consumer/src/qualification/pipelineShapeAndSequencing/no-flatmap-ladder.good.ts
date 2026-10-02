import { Effect } from "effect";
import * as E from "effect/Effect";
export const task = Effect.gen(function*() {
  const n = yield* Effect.succeed(1);
  const m = yield* Effect.succeed(n + 40);
  return m + 1;
});
export const shallow = Effect.flatMap(Effect.succeed(1), n => Effect.succeed(n + 41));
export const mapped = Effect.map(Effect.succeed(1), n => n + 41);
// Existing policy gaps: data-last pipe, alias and concise body are not repairs.
export const piped = Effect.succeed(1).pipe(Effect.flatMap(n => Effect.flatMap(Effect.succeed(n + 40), m => Effect.succeed(m + 1))));
export const alias = E.flatMap(E.flatMap(E.succeed(1), n => E.succeed(n + 40)), n => E.succeed(n + 1));
export const concise = () => Effect.flatMap(Effect.flatMap(Effect.succeed(1), n => Effect.succeed(n + 40)), n => Effect.succeed(n + 1));
export function repaired(events: string[], failure?: object) {
  return Effect.gen(function*() {
    const n = yield* Effect.sync(() => { events.push("first"); return 1; });
    const m = yield* (failure ? Effect.fail(failure) : Effect.sync(() => { events.push("second"); return n + 40; }));
    yield* Effect.sync(() => { events.push("third"); });
    return m + 1;
  });
}
