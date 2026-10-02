import { Effect, Exit, Option, Ref } from "effect";
import * as bad from "./no-effect-all-step-sequencing.bad";
import * as good from "./no-effect-all-step-sequencing.good";
import * as valueBad from "./no-effect-succeed-variable.bad";
import * as valueGood from "./no-effect-succeed-variable.good";
const before = await Effect.runPromise(Ref.make(0)), after = await Effect.runPromise(Ref.make(0));
const old = bad.sequential(before), repaired = good.sequential(after);
if (await Effect.runPromise(Ref.get(before)) !== 0 || await Effect.runPromise(Ref.get(after)) !== 0) throw new Error("State changed during construction");
const oldValues = await Effect.runPromise(old), newValues = await Effect.runPromise(repaired);
if (oldValues.length !== 2 || newValues.length !== 2 || [...oldValues, ...newValues].some(n => n !== undefined)) throw new Error("Collection output changed");
if (await Effect.runPromise(Ref.get(before)) !== 42 || await Effect.runPromise(Ref.get(after)) !== 42) throw new Error("Final state changed");
await Effect.runPromise(Ref.set(before, 0)); await Effect.runPromise(Ref.set(after, 0));
if (await Effect.runPromise(bad.discarded(before)) !== undefined || await Effect.runPromise(good.discarded(after)) !== undefined) throw new Error("Discard result changed");
if (await Effect.runPromise(Ref.get(before)) !== 42 || await Effect.runPromise(Ref.get(after)) !== 42) throw new Error("Discard state changed");
const failure = { _tag: "Q44Failure" };
await Effect.runPromise(Ref.set(before, 0)); await Effect.runPromise(Ref.set(after, 0));
const failedOld = Effect.all([Effect.fail(failure), Ref.set(before, 42)], { concurrency: 1 });
const failedNew = Effect.gen(function*() { yield* Effect.fail(failure); yield* Ref.set(after, 42); });
for (const task of [failedOld, failedNew]) {
  if (!Exit.isFailure(await Effect.runPromiseExit(task)) || await Effect.runPromise(Effect.flip(task)) !== failure) throw new Error("Failure identity changed");
}
if (await Effect.runPromise(Ref.get(before)) !== 0 || await Effect.runPromise(Ref.get(after)) !== 0) throw new Error("Later state step ran after failure");
const aggregate = await Effect.runPromise(good.values);
if (aggregate.join() !== "20,22") throw new Error("Value aggregation changed");
for (const task of [valueBad.identifier, valueBad.member, valueBad.computed, valueBad.branch(true), valueGood.literal, valueGood.called, valueGood.select(true)]) if (await Effect.runPromise(task) !== 42) throw new Error("Selected value changed");
if (await Effect.runPromise(valueBad.branch(false)) !== 0 || await Effect.runPromise(valueGood.select(false)) !== 0 || await Effect.runPromise(valueBad.absent) !== undefined || valueBad.ordinary() !== 42) throw new Error("Branch/absence changed");
if (valueGood.optional(Option.some(42)) !== 42 || valueGood.optional(Option.none()) !== 0) throw new Error("Optional data changed");
if ((await Effect.runPromise(valueGood.aggregate)).value !== 42) throw new Error("Aggregate value changed");
