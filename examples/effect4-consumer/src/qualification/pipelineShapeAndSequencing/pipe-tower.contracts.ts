import { Effect } from "effect";
import * as pipeBad from "./no-pipe-ladder.bad";
import * as pipeGood from "./no-pipe-ladder.good";
import * as towerBad from "./no-call-tower.bad";
import * as towerGood from "./no-call-tower.good";
import { repaired } from "./terminal-recovery.good";

for (const value of [pipeBad.depth, pipeBad.unused, pipeGood.aliased, towerGood.thirdArgument()]) if (value !== 42) throw new Error("Q42 pure value changed");
for (const task of [pipeBad.free, pipeBad.receiver, pipeGood.task, pipeGood.flat, pipeGood.computed, towerBad.mapped, towerBad.second, towerBad.both, towerBad.three, towerGood.flat, towerGood.task, towerGood.aliased, towerGood.computed, towerGood.callback]) if (await Effect.runPromise(task) !== 42) throw new Error("Q42 task value changed");
if (await Effect.runPromise(towerBad.unary) !== undefined) throw new Error("Void tower changed");
const originalFailure = { _tag: "Q42Failure" };
if (await Effect.runPromise(Effect.flip(Effect.fail(originalFailure))) !== originalFailure) throw new Error("Source failure identity changed");
for (const failure of [undefined, originalFailure]) {
  const events: string[] = [];
  if (await Effect.runPromise(repaired(events, failure)) !== 42 || events.join() !== (failure ? "first,fallback" : "first,second")) throw new Error("Terminal recovery changed order/fallback count");
  
}
