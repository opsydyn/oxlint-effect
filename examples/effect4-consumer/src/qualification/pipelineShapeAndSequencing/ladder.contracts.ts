import { Effect, Exit } from "effect";
import * as bad from "./deep-effect.bad";
import * as good from "./deep-effect.good";
import * as flat from "./no-flatmap-ladder.bad";
import * as repaired from "./no-flatmap-ladder.good";
for (const task of [bad.assigned, bad.four, bad.returned(), bad.concise(), bad.left, bad.right, good.task, good.explicit, good.shallow, good.computed, good.alias, flat.input, flat.callback, flat.flattened(), flat.left, flat.right, flat.unused, repaired.task, repaired.shallow, repaired.mapped, repaired.piped, repaired.alias, repaired.concise()]) {
  if (await Effect.runPromise(task) !== 42) throw new Error("Q41 ladder value changed");
}
function original(events: string[], failure?: object) {
  return Effect.flatMap(
    Effect.flatMap(Effect.sync(() => { events.push("first"); return 1; }), n => failure ? Effect.fail(failure) : Effect.sync(() => { events.push("second"); return n + 40; })),
    m => Effect.map(Effect.sync(() => { events.push("third"); }), () => m + 1),
  );
}
for (const failure of [undefined, { _tag: "Q41Failure" }]) {
  const before: string[] = [], after: string[] = [];
  const badTask = original(before, failure), goodTask = repaired.repaired(after, failure);
  if (failure) {
    if (!Exit.isFailure(await Effect.runPromiseExit(badTask)) || !Exit.isFailure(await Effect.runPromiseExit(goodTask))) throw new Error("Failure was swallowed");
    before.length = 0; after.length = 0;
    if (await Effect.runPromise(Effect.flip(badTask)) !== failure || await Effect.runPromise(Effect.flip(goodTask)) !== failure) throw new Error("Failure identity changed");
  } else if (await Effect.runPromise(badTask) !== 42 || await Effect.runPromise(goodTask) !== 42) throw new Error("Repair value changed");
  if (before.join() !== after.join() || before.join() !== (failure ? "first" : "first,second,third")) throw new Error("Sequencing/short circuit changed");
}

for (const task of [flat.eager, flat.eagerInner, flat.eagerOuter]) if (await Effect.runPromise(task) !== 42) throw new Error("Eager ladder changed");
