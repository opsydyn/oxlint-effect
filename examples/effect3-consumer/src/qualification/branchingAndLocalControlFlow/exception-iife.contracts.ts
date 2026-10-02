import { Effect, Exit } from "effect";
import * as bad from "./no-try-catch.bad";
import * as arrow from "./no-arrow-ladder.bad";
import * as iife from "./no-iife-wrapper.bad";
import * as good from "./wrappers.good";
for (const value of [bad.nested(), bad.unused(), arrow.simple, arrow.depth, arrow.unused, arrow.siblings, iife.arrow, iife.regular, iife.nested, good.value, good.callGap]) if (value !== 42) throw new Error("Q46 wrapper value changed");
for (const task of [arrow.task, iife.task, good.task]) if (await Effect.runPromise(task) !== 42) throw new Error("Effect wrapper result changed");
if (await iife.asynchronous !== 42 || await good.asynchronous() !== 42 || iife.generator.next().value !== 42 || good.generator().next().value !== 42) throw new Error("Async/generator semantics changed");
const error = { _tag: "Q46Failure" };
const failing = () => { throw error; };
const original = bad.attempt(failing), repair = await Effect.runPromise(good.attempt(failing));
if (typeof original !== "object" || typeof repair !== "object" || original._tag !== repair._tag || original.error !== error || repair.error !== error || bad.attempt(() => 42) !== await Effect.runPromise(good.attempt(() => 42))) throw new Error("Exception adapter result/error identity changed");
for (const failure of [false, true]) {
  const before: string[] = [], after: string[] = [];
  const fn = () => { if (failure) throw error; return 42; };
  const task = good.cleanup(fn, after);
  if (after.length) throw new Error("Cleanup happened during construction");
  if (failure) {
    let caught: unknown;
    try { bad.cleanup(fn, before); } catch (e) { caught = e; }
    if (caught !== error || !Exit.isFailure(await Effect.runPromiseExit(task))) throw new Error("Cleanup failure changed");
    after.length = 0;
    if (await Effect.runPromise(Effect.flip(task)) !== error) throw new Error("Cleanup failure identity changed");
  } else if (bad.cleanup(fn, before) !== 42 || await Effect.runPromise(task) !== 42) throw new Error("Cleanup success changed");
  if (before.join() !== "cleanup" || after.join() !== "cleanup") throw new Error("Cleanup count changed");
}
const events: string[] = [];
const deferred = good.deferred(async () => { events.push("call"); return 42; });
if (events.length || await Effect.runPromise(deferred) !== 42 || events.join() !== "call") throw new Error("Deferred promise semantics changed");
