import { Deferred, Effect, Exit, Fiber, Option, PubSub, Queue, Cause, TestClock, TestContext } from "effect";

import * as timeoutBad from "./no-timeout-with-noninterruptible-promise.bad";
import * as timeoutGood from "./no-timeout-with-noninterruptible-promise.good";
import * as maskBad from "./no-uninterruptible-concurrent-region.bad";
import * as maskGood from "./no-uninterruptible-concurrent-region.good";
import * as buffersBad from "./no-unbounded-queue-or-pubsub.bad";
import * as buffersGood from "./no-unbounded-queue-or-pubsub.good";
const original = { _tag: "Q19Failure", value: 42 };
function assertFailure(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const failure = Cause.failureOption(exit.cause);
  if (failure._tag !== "Some" || failure.value !== original) throw new Error("Original error identity changed");
}
async function checkTimeout<A, E>(wrap: (operation: (signal?: AbortSignal) => Promise<number>) => Effect.Effect<A, E>, aware: boolean, outcome: "failure" | "none" | "fallback" = "failure") {
  const program = Effect.gen(function* () {
    const started = yield* Deferred.make<void>();
    let open = false;
    let aborted = 0;
    let stop = () => {};
    let completion = Promise.resolve(0);
    const operation = (signal?: AbortSignal) => {
      open = true;
      completion = new Promise<number>(resolve => {
        stop = () => { open = false; resolve(42); };
        signal?.addEventListener("abort", () => { aborted++; open = false; resolve(0); }, { once: true });
        Effect.runSync(Deferred.succeed(started, undefined));
      });
      return completion;
    };
    const fiber = yield* Effect.fork(wrap(operation));
    yield* Deferred.await(started);
    yield* TestClock.adjust("1 second");
    const exit = yield* Fiber.await(fiber);
    const isOpen = () => open;
    if (isOpen() !== !aware || aborted !== (aware ? 1 : 0)) throw new Error("Underlying cancellation ownership changed");
    if (outcome === "failure") {
      if (!Exit.isFailure(exit)) throw new Error("Timeout did not fail");
      const failure = Cause.failureOption(exit.cause);
      if (failure._tag !== "Some" || typeof failure.value !== "object" || failure.value === null || !("_tag" in failure.value) || failure.value._tag !== "TimeoutException") throw new Error("Major-specific timeout error channel changed");
    } else {
      if (!Exit.isSuccess(exit)) throw new Error("Timeout outcome disappeared");
      const value: unknown = exit.value;
      if (outcome === "fallback" ? value !== 42 : typeof value !== "object" || value === null || !("_tag" in value) || value._tag !== "None") throw new Error("Timeout outcome changed");
    }
    // Settle raw work explicitly; no live promises/timers escape the contract.
    stop();
    yield* Effect.promise(() => completion);
  });
  await Effect.runPromise(Effect.provide(program, TestContext.TestContext));
}
for (const wrap of [timeoutBad.direct, timeoutBad.tryFunction, timeoutBad.tryObject]) await checkTimeout(wrap, false);
await checkTimeout(timeoutGood.direct, true);
await checkTimeout(timeoutBad.legacySignal, true);
if (await Effect.runPromise(timeoutGood.typed(() => Promise.resolve(42), original)) !== 42) throw new Error("Adapter result changed");
assertFailure(await Effect.runPromiseExit(timeoutGood.typed(() => Promise.reject(original), original)));
// Deliver interruption to actually suspended work, without elapsed-time assertions.
for (const repaired of [false, true]) {
  await Effect.runPromise(Effect.gen(function* () {
    const started = yield* Deferred.make<void>();
    const release = yield* Deferred.make<void>();
    let finalized = 0;
    const task = Effect.gen(function* () { yield* Deferred.succeed(started, undefined); yield* Deferred.await(release); return 42; }).pipe(Effect.ensuring(Effect.sync(() => { finalized++; })));
    const fiber = yield* Effect.fork(repaired ? maskGood.restored(task) : maskBad.masked(task));
    yield* Deferred.await(started);
    if (repaired) {
      yield* Fiber.interrupt(fiber);
      if (finalized !== 1) throw new Error("Restored work did not release on interruption");
    } else {
      yield* Fiber.interruptFork(fiber);
      yield* Effect.yieldNow();
      const pending = yield* Fiber.poll(fiber);
      if (!Option.isNone(pending) || finalized !== 0) throw new Error("Masked work unexpectedly stopped before release");
      yield* Deferred.succeed(release, undefined);
    }
    const exit = yield* Fiber.await(fiber);
    if (!Exit.isFailure(exit) || finalized !== 1) throw new Error("Pending interruption or exactly-once finalizer lost");
  }));
}
if (await Effect.runPromise(maskGood.short) !== 42 || (await Effect.runPromise(maskBad.forEach)).join(",") !== "1,2" || await Effect.runPromise(maskBad.race) !== 42) throw new Error("Finite masked values changed");
// Bounded queues preserve FIFO while suspending the second producer.
await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
  const queue = yield* Effect.acquireRelease(buffersGood.queue, queue => Queue.shutdown(queue));
  const started = yield* Deferred.make<void>();
  yield* Queue.offer(queue, 1);
  const producer = yield* Effect.fork(Effect.gen(function* () { yield* Deferred.succeed(started, undefined); return yield* Queue.offer(queue, 2); }));
  yield* Deferred.await(started);
  yield* Effect.yieldNow();
  const pending = yield* Fiber.poll(producer);
  if (!Option.isNone(pending)) throw new Error("Bounded queue did not apply backpressure");
  if ((yield* Queue.take(queue)) !== 1 || !(yield* Fiber.join(producer)) || (yield* Queue.take(queue)) !== 2) throw new Error("Queue FIFO or producer acknowledgement changed");
})));
// PubSub needs a live scoped subscriber; without one it retains no pending messages.
await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
  const pubsub = yield* Effect.acquireRelease(buffersGood.pubsub, pubsub => PubSub.shutdown(pubsub));
  const subscription = yield* PubSub.subscribe(pubsub);
  const started = yield* Deferred.make<void>();
  yield* PubSub.publish(pubsub, 1);
  const producer = yield* Effect.fork(Effect.gen(function* () { yield* Deferred.succeed(started, undefined); return yield* PubSub.publish(pubsub, 2); }));
  yield* Deferred.await(started);
  yield* Effect.yieldNow();
  const pending = yield* Fiber.poll(producer);
  if (!Option.isNone(pending) || PubSub.capacity(pubsub) !== 1) throw new Error("PubSub did not apply backpressure");
  if ((yield* Queue.take(subscription)) !== 1 || !(yield* Fiber.join(producer)) || (yield* Queue.take(subscription)) !== 2) throw new Error("PubSub subscriber order changed");
})));
for (const constructor of [buffersBad.queue]) {
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const queue = yield* Effect.acquireRelease(constructor, queue => Queue.shutdown(queue));
    yield* Queue.offerAll(queue, [1, 2, 3]);
    if ((yield* Queue.size(queue)) !== 3 || Queue.capacity(queue) !== Infinity) throw new Error("Unbounded constructor contract changed");
    for (const expected of [1, 2, 3]) if ((yield* Queue.take(queue)) !== expected) throw new Error("Unbounded queue order changed");
  })));
}
await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
  const pubsub = yield* Effect.acquireRelease(buffersBad.pubsub, pubsub => PubSub.shutdown(pubsub));
  const subscription = yield* PubSub.subscribe(pubsub);
  yield* PubSub.publishAll(pubsub, [1, 2, 3]);
  if (PubSub.capacity(pubsub) !== Number.MAX_SAFE_INTEGER) throw new Error("Unbounded PubSub capacity sentinel changed");
  for (const expected of [1, 2, 3]) if ((yield* Queue.take(subscription)) !== expected) throw new Error("Unbounded subscriber order changed");
})));
