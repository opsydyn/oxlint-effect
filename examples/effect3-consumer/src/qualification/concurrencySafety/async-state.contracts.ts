import { Effect, Exit, Fiber, Cause } from "effect";
import * as blockingBad from "./no-blocking-call-in-effect.bad";
import * as blockingGood from "./no-blocking-call-in-effect.good";
import * as promiseBad from "./no-promise-concurrency-in-effect.bad";
import * as promiseGood from "./no-promise-concurrency-in-effect.good";
import * as stateBad from "./no-shared-mutable-state-across-fibers.bad";
import * as stateGood from "./no-shared-mutable-state-across-fibers.good";
const original = { _tag: "Q18Failure", value: 42 };
function assertFailure(exit: Exit.Exit<unknown, typeof original>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const failure = Cause.failureOption(exit.cause);
  if (failure._tag !== "Some" || failure.value !== original) throw new Error("Original error identity changed");
}
for (const program of [blockingBad.sync, blockingBad.generator, blockingBad.suffix, blockingGood.asynchronous]) {
  if (await Effect.runPromise(program) !== 42) throw new Error("Async boundary changed value");
}
if (await Effect.runPromise(blockingGood.adapter(() => Promise.resolve(42), original)) !== 42) throw new Error("Adapter value changed");
assertFailure(await Effect.runPromiseExit(blockingGood.adapter(() => Promise.reject(original), original)));
if ((await Effect.runPromise(promiseBad.all)).join(",") !== "1,2" || (await Effect.runPromise(promiseGood.all)).join(",") !== "1,2") throw new Error("Ordered aggregate results changed");
const rawSettled = await Effect.runPromise(promiseBad.settled);
const settled = await Effect.runPromise(promiseGood.settled);
if (rawSettled[0].status !== "fulfilled" || rawSettled[0].value !== 1 || rawSettled[1].status !== "rejected" || rawSettled[1].reason !== "expected") throw new Error("Raw outcomes changed");
if (settled[0]._tag !== "Right" || settled[0].right !== 1 || settled[1]._tag !== "Left" || settled[1].left !== "expected") throw new Error("Typed outcomes changed");
for (const program of [promiseBad.first, promiseBad.success]) if (await Effect.runPromise(program) !== 42) throw new Error("Raw race value changed");
if ((await Effect.runPromise(promiseBad.mapped)).join(",") !== "42") throw new Error("Mapped result changed");
if (await Effect.runPromise(promiseBad.recovered) !== 42) throw new Error("Recovery result changed");

assertFailure(await Effect.runPromiseExit(promiseGood.first(Effect.fail(original), Effect.never)));
if (await Effect.runPromise(promiseGood.success(Effect.fail(original), Effect.succeed(42))) !== 42) throw new Error("Success race settled on failure");
// Raw Promise.race leaves its loser active; explicitly settle it for teardown.
let rawOpen = true;
let stopRaw = () => {};
const rawLoser = new Promise<number>(resolve => { stopRaw = () => { rawOpen = false; resolve(0); }; });
if (await Promise.race([Promise.resolve(42), rawLoser]) !== 42 || !rawOpen) throw new Error("Raw race unexpectedly stopped loser");
stopRaw();
await rawLoser;
// Repaired race aborts an actually started signal-aware operation once.
let markStarted = () => {};
const started = new Promise<void>(resolve => { markStarted = resolve; });
let aborted = 0;
const loser = promiseGood.adapter(signal => new Promise<number>((_resolve, reject) => {
  signal.addEventListener("abort", () => { aborted++; reject(original); }, { once: true });
  markStarted();
}), original);
const winner = Effect.gen(function* () { yield* Effect.promise(() => started); return 42; });
if (await Effect.runPromise(promiseGood.first(winner, loser)) !== 42 || aborted !== 1) throw new Error("Race loser was not cooperatively stopped once");
// Force both workers to read the same old value before either may write.
stateBad.reset();
let waiting = 0;
const releases: Array<() => void> = [];
const beforeWrite = () => new Promise<void>(resolve => {
  releases.push(resolve);
  if (++waiting === 2) for (const release of releases) release();
});
await Effect.runPromise(stateBad.lostUpdate(beforeWrite));
if (waiting !== 2 || stateBad.read() !== 1) throw new Error("Lost-update counterexample was not exercised");
if (await Effect.runPromise(stateGood.count) !== 2) throw new Error("Atomic Ref update lost work");
if ((await Effect.runPromise(stateGood.values)).join(",") !== "1,2") throw new Error("Immutable aggregation changed order");
if (await Effect.runPromise(stateGood.observedLocal) !== 1) throw new Error("Worker-local state changed");
stateBad.reset();
if ((await Effect.runPromise(stateBad.all)).join(",") !== "1,2") throw new Error("Synchronous writes changed");
stateBad.reset();
await Effect.runPromise(stateBad.sequential);
if (stateBad.read() !== 2) throw new Error("Default collection was not sequential");
for (const task of [stateBad.fork]) {
  stateBad.reset();
  const value = await Effect.runPromise(Effect.gen(function* () { const handle = yield* task; return yield* Fiber.join(handle); }));
  if (value !== 1) throw new Error("Inline fork mutation changed");
}
