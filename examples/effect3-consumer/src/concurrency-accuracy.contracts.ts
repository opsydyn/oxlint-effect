import { Effect } from "effect";
import * as good from "./concurrency-accuracy.good";

for (const collect of [good.sequential, good.singleWorker]) {
  const values = await Effect.runPromise(collect());
  if (values.join(",") !== "1,2") throw new Error("Sequential state order changed");
}
for (const [program, expected] of [[good.workerLocal, "2,3"], [good.immutable, "2,4"]] as const) {
  if ((await Effect.runPromise(program)).join(",") !== expected) throw new Error("Parallel results changed");
}
if (await Effect.runPromise(good.atomic) !== 2) throw new Error("Atomic increments were lost");
if (await Effect.runPromise(good.pureRace) !== 42) throw new Error("Pure race changed winner");
const original = { _tag: "AccuracyFailure" };
if (await Effect.runPromise(good.opaqueRace(Effect.fail(original), Effect.succeed(42))) !== 42) throw new Error("First-success race settled on failure");
const failure = await Effect.runPromise(Effect.flip(Effect.raceFirst(Effect.fail(original), Effect.never)));
if (failure !== original) throw new Error("First-completion race changed original failure");
console.log("Concurrency accuracy contracts completed");
