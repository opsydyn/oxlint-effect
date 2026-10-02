import { Cause, Deferred, Effect, Exit, Fiber, Option, Queue, STM, TSemaphore, TestClock, TestContext } from "effect";

import * as globalBad from "./no-global-mutable-concurrency-state.bad";
import * as globalGood from "./no-global-mutable-concurrency-state.good";
import * as deferredBad from "./no-manual-deferred-coordination.bad";
import * as deferredGood from "./no-manual-deferred-coordination.good";
import * as permitBad from "./no-yield-with-held-semaphore-permit.bad";
import * as permitGood from "./no-yield-with-held-semaphore-permit.good";
const original = { _tag: "Q20Failure", value: 42 };
function assertFailure(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const failure = Cause.failureOption(exit.cause);
  if (failure._tag !== "Some" || failure.value !== original) throw new Error("Original error identity changed");
}
function assertInterrupted(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit) || !Cause.isInterrupted(exit.cause)) throw new Error("Interruption channel changed");
}
for (const program of [globalBad.all, globalBad.append, globalBad.map, globalBad.set]) {
  globalBad.reset();
  if ((await Effect.runPromise(program)).join(",") !== "1,2") throw new Error("Module operation result changed");
}
for (const task of [globalBad.fork]) {
  globalBad.reset();
  if (await Effect.runPromise(Effect.gen(function* () { const fiber = yield* task; return yield* Fiber.join(fiber); })) !== 1) throw new Error("Module fork value changed");
}
globalBad.reset();
let waiting = 0;
const releases: Array<() => void> = [];
await Effect.runPromise(globalBad.lostUpdate(() => new Promise<void>(resolve => { releases.push(resolve); if (++waiting === 2) for (const release of releases) release(); })));
if (globalBad.read() !== 1 || waiting !== 2) throw new Error("Module lost-update counterexample did not execute");
for (const _ of [1, 2]) if (await Effect.runPromise(globalGood.count) !== 2) throw new Error("Per-owner Ref state leaked or lost work");
if ((await Effect.runPromise(globalGood.values)).join(",") !== "1,2") throw new Error("Immutable values changed");
if ((await Effect.runPromise(globalBad.localLegacy())).join(",") !== "1,2") throw new Error("Legacy local warning changed behaviour");
// Producer completion, original failure and caller interruption for actual local latches.
type Latch = Deferred.Deferred<number, typeof original>;
type Factory = (onReady: (latch: Latch) => void) => Effect.Effect<number, unknown>;
for (const factory of [deferredBad.made, deferredBad.unsafe, deferredBad.unprotectedPipe, deferredGood.bounded, deferredGood.finalized, deferredGood.markerOnly]) {
  for (const mode of ["value", "failure", "interrupt"] as const) {
    let publish: (latch: Latch) => void = () => { throw new Error("Registration missing"); };
    const registration = new Promise<Latch>(resolve => { publish = resolve; });
    const fiber = Effect.runFork((factory satisfies Factory)(publish));
    const latch = await registration;
    if (mode === "value") {
      if (!await Effect.runPromise(Deferred.succeed(latch, 42))) throw new Error("Latch did not complete");
    } else if (mode === "failure") await Effect.runPromise(Deferred.fail(latch, original));
    else await Effect.runPromise(Fiber.interrupt(fiber));
    const exit = await Effect.runPromise(Fiber.await(fiber));
    if (mode === "value") {
      if (!Exit.isSuccess(exit) || exit.value !== 42 || await Effect.runPromise(Deferred.succeed(latch, 0))) throw new Error("Exactly-once latch result changed");
    } else if (mode === "failure") assertFailure(exit);
    else assertInterrupted(exit);
    // Scope markers do not imply latch completion; the real finalizer does.
    if (mode === "interrupt" && factory === deferredGood.finalized) assertInterrupted(await Effect.runPromiseExit(Deferred.await(latch)));
    await Effect.runPromise(Deferred.interrupt(latch));
  }
}
async function bound<A>(factory: (onReady: (latch: Deferred.Deferred<number, unknown>) => void) => Effect.Effect<A, unknown>, kind: "failure" | "none" | "fallback") {
  await Effect.runPromise(Effect.provide(Effect.gen(function* () {
    const registered = yield* Deferred.make<Deferred.Deferred<number, unknown>>();
    const fiber = yield* Effect.fork(factory(latch => { Effect.runSync(Deferred.succeed(registered, latch)); }));
    const latch = yield* Deferred.await(registered);
    yield* TestClock.adjust("1 second");
    const exit = yield* Fiber.await(fiber);
    if (kind === "failure") {
      if (!Exit.isFailure(exit)) throw new Error("Latch timeout did not fail");
      const failure = Cause.failureOption(exit.cause);
      if (failure._tag !== "Some" || typeof failure.value !== "object" || failure.value === null || !("_tag" in failure.value) || failure.value._tag !== "TimeoutException") throw new Error("Latch timeout channel changed");
    } else {
      if (!Exit.isSuccess(exit)) throw new Error("Latch bounded outcome failed");
      const value: unknown = exit.value;
      if (kind === "fallback" ? value !== 42 : typeof value !== "object" || value === null || !("_tag" in value) || value._tag !== "None") throw new Error("Latch bounded outcome changed");
    }
    if (!Option.isNone(yield* Deferred.poll(latch))) throw new Error("Timeout incorrectly completed the latch");
    yield* Deferred.interrupt(latch);
  }), TestContext.TestContext));
}
await bound(deferredGood.bounded, "failure");

// An unrelated wait holds the bad critical section; narrowing permits a contender.
for (const repaired of [false, true]) for (const mode of ["value", "failure", "interrupt"] as const) {
  await Effect.runPromise(Effect.gen(function* () {
    const semaphore = yield* Effect.makeSemaphore(1);
    const gate = yield* Deferred.make<number, typeof original>();
    const started = yield* Deferred.make<void>();
    const attempt = yield* Deferred.make<void>();
    let finalized = 0;
    const task = (repaired ? permitGood.narrowed(semaphore, gate, started) : permitBad.held(semaphore, gate, started)).pipe(Effect.ensuring(Effect.sync(() => { finalized++; })));
    const owner = yield* Effect.fork(task);
    yield* Deferred.await(started);
    const contender = yield* Effect.fork(Effect.gen(function* () { yield* Deferred.succeed(attempt, undefined); return yield* semaphore.withPermits(1)(Effect.succeed(42)); }));
    yield* Deferred.await(attempt);
    if (repaired) {
      if ((yield* Fiber.join(contender)) !== 42) throw new Error("Narrowed section stranded contender");
    } else {
      yield* Effect.yieldNow();
      const pending = yield* Fiber.poll(contender);
      if (!Option.isNone(pending)) throw new Error("Unrelated wait did not hold the permit");
    }
    if (mode === "value") yield* Deferred.succeed(gate, 42);
    else if (mode === "failure") yield* Deferred.fail(gate, original);
    else yield* Fiber.interrupt(owner);
    const exit = yield* Fiber.await(owner);
    if (mode === "value") { if (!Exit.isSuccess(exit) || exit.value !== 42) throw new Error("Permit result changed"); }
    else if (mode === "failure") assertFailure(exit);
    else assertInterrupted(exit);
    if ((yield* Fiber.join(contender)) !== 42 || finalized !== 1) throw new Error("Permit/finalizer was not released once");
    // take returns the acquired count, not remaining capacity, in both implementations.
    if ((yield* semaphore.take(1)) !== 1 || !Option.isNone(yield* semaphore.withPermitsIfAvailable(1)(Effect.succeed(true))) || (yield* semaphore.release(1)) !== 1) throw new Error("Permit leaked or was double released");
    yield* Deferred.interrupt(gate);
  }));
}
await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
  const semaphore = yield* Effect.makeSemaphore(1);
  const gate = yield* Deferred.make<number>();
  yield* Deferred.succeed(gate, 42);
  if ((yield* permitBad.promise(semaphore)) !== 42 || (yield* permitGood.sync(semaphore)) !== 42) throw new Error("Permit adapter value changed");
  yield* permitBad.sleep(semaphore);
  const transactional = yield* STM.commit(TSemaphore.make(1));
  if ((yield* permitBad.transactional(transactional, gate)) !== 42 || (yield* permitBad.transactionalMany(transactional)) !== 42) throw new Error("Transactional permit value changed");
  const queue = yield* Effect.acquireRelease(Queue.bounded<number>(1), queue => Queue.shutdown(queue));
  yield* Queue.offer(queue, 42);
  if ((yield* permitBad.transactionalCurried(transactional, queue)) !== 42) throw new Error("Transactional curried value changed");
})));
