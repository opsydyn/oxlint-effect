import { Cause, Effect, Exit } from "effect";
import * as aliasBad from "./no-effect-wrapper-alias.bad";
import * as aliasGood from "./no-effect-wrapper-alias.good";
import * as syncBad from "./warn-effect-sync-wrapper.bad";
import * as syncGood from "./warn-effect-sync-wrapper.good";
import * as sideBad from "./no-effect-side-effect-wrapper.bad";
import * as sideGood from "./no-effect-side-effect-wrapper.good";
for (const task of [aliasBad.receiver, aliasBad.free, aliasBad.concise(), aliasBad.returned(), aliasBad.left(), aliasBad.right(), aliasGood.task, aliasGood.generator, aliasGood.block(), aliasGood.alias(), syncBad.pure, syncBad.member, syncBad.nested, syncGood.pure, syncGood.literal, syncGood.named, syncGood.expression, sideBad.logged, sideBad.sequence, sideBad.unused, sideGood.logged, sideGood.sequence]) if (await Effect.runPromise(task) !== 42) throw new Error("Q43 wrapper value changed");
if (aliasBad.unused() !== 42 || aliasGood.value !== 42) throw new Error("Pure domain value changed");
const before: string[] = [], after: string[] = [];
const oldTask = syncBad.deferred(before), newTask = syncGood.deferred(after);
if (before.length || after.length) throw new Error("Construction eagerly executed the callback");
for (let i = 0; i < 2; i++) if (await Effect.runPromise(oldTask) !== 42 || await Effect.runPromise(newTask) !== 42) throw new Error("Deferred result changed");
if (before.join() !== "touch,touch" || after.join() !== before.join()) throw new Error("Callback execution count changed");
for (const name of ["state", "invalidation", "atom"] as const) {
  before.length = 0; after.length = 0;
  const old = sideBad[name](before), next = sideGood[name](after);
  if (before.length || after.length || await Effect.runPromise(old) !== 42 || await Effect.runPromise(next) !== 42 || before.join() !== after.join() || before.length !== 1) throw new Error("Side effect was eager, duplicated or lost");
}
const saved = console.info, messages: string[] = [];
try {
  console.info = (...args: unknown[]) => { messages.push(args.join(" ")); };
  if (await Effect.runPromise(sideBad.consoleTask()) !== 42 || await Effect.runPromise(sideGood.consoleTask()) !== 42) throw new Error("Console value changed");
  await Effect.runPromise(syncGood.consoleExcluded);
  if (messages.join("|") !== "Q43 console|Q43 console|Q43 console control") throw new Error("Console effect count changed");
} finally { console.info = saved; }
const error = { _tag: "Q43Defect" };
for (const task of [syncBad.defect(error), syncGood.defect(error)]) {
  const exit = await Effect.runPromiseExit(task);
  if (!Exit.isFailure(exit)) throw new Error("Defect changed into success");
  if (Array.from(Cause.defects(exit.cause))[0] !== error) throw new Error("Defect identity changed");
}
