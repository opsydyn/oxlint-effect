import { Cause, Deferred, Effect, Exit, Fiber, Option, SubscriptionRef, SynchronizedRef } from "effect";
import * as refBad from "./no-yield-with-held-mutable-ref.bad";
import * as refGood from "./no-yield-with-held-mutable-ref.good";
import * as backgroundBad from "./no-unscoped-background-fiber.bad";
import * as backgroundGood from "./no-unscoped-background-fiber.good";
import * as resourceBad from "./no-acquire-without-scoped-release.bad";
import * as resourceGood from "./no-acquire-without-scoped-release.good";
import { openConnection, type Connection } from "./lifetime-support";
const original = { _tag: "Q21Failure", value: 42 };
function assertFailure(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const error = Cause.failureOption(exit.cause);
  if (error._tag !== "Some" || error.value !== original) throw new Error("Original error identity changed");
}
function assertInterrupted(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit) || !(Cause.isInterrupted(exit.cause))) throw new Error("Interruption channel changed");
}
// Independent delta computation can leave the lock; state-dependent I/O cannot be split blindly.
for (const repaired of [false, true]) for (const mode of ["value", "failure", "interrupt"] as const) {
  await Effect.runPromise(Effect.gen(function* () {
    const ref = yield* SynchronizedRef.make(0);
    const gate = yield* Deferred.make<number, typeof original>();
    const started = yield* Deferred.make<void>();
    const attempt = yield* Deferred.make<void>();
    let finalized = 0;
    const task = (repaired ? refGood.narrowed(ref, gate, started) : refBad.held(ref, gate, started)).pipe(Effect.ensuring(Effect.sync(() => { finalized++; })));
    const owner = yield* Effect.fork(task);
    yield* Deferred.await(started);
    const contender = yield* Effect.fork(Effect.gen(function* () { yield* Deferred.succeed(attempt, undefined); yield* SynchronizedRef.update(ref, value => value + 1); return 42; }));
    yield* Deferred.await(attempt);
    if (repaired) {
      if ((yield* Fiber.join(contender)) !== 42) throw new Error("Independent work still held ref lock");
    } else {
      yield* Effect.yieldNow();
      if (!(Option.isNone(yield* Fiber.poll(contender)))) throw new Error("Held modifier did not serialize contender");
    }
    if (mode === "value") yield* Deferred.succeed(gate, 1);
    else if (mode === "failure") yield* Deferred.fail(gate, original);
    else yield* Fiber.interrupt(owner);
    const exit = yield* Fiber.await(owner);
    if (mode === "value") { if (!Exit.isSuccess(exit)) throw new Error("Ref update failed"); }
    else if (mode === "failure") assertFailure(exit);
    else assertInterrupted(exit);
    if ((yield* Fiber.join(contender)) !== 42 || finalized !== 1 || (yield* SynchronizedRef.get(ref)) !== (mode === "value" ? 2 : 1)) throw new Error("Ref lock/state/finalizer contract changed");
    yield* Deferred.interrupt(gate);
  }));
}
await Effect.runPromise(Effect.gen(function* () {
  const ref = yield* SynchronizedRef.make(0);
  if ((yield* refBad.modify(ref)) !== 42 || (yield* refBad.partial(ref)) !== 42 || (yield* refBad.updateAndGet(ref)) !== 3) throw new Error("Modifier result changed");
  yield* refBad.curried(ref);
  if ((yield* refBad.instance(ref)) !== 42) throw new Error("Legacy instance result changed");
  const before = yield* SynchronizedRef.get(ref);
  if (before !== 5) throw new Error("Legacy modifier updates changed");
  const result = yield* SynchronizedRef.modifySomeEffect(ref, 42, () => Option.none<Effect.Effect<readonly [number, number]>>());
  if (result !== 42 || (yield* SynchronizedRef.get(ref)) !== before) throw new Error("Partial no-update branch changed");
  const subscription = yield* SubscriptionRef.make(0);
  yield* refBad.subscription(subscription);
  if ((yield* SubscriptionRef.get(subscription)) !== 1) throw new Error("Subscription update changed");
}));
// Detached task survives caller completion, even when joined/returned or scoped inside.
for (const factory of [backgroundBad.direct, backgroundBad.returned, backgroundBad.scopedInside, backgroundGood.supervised]) {
  const gate = await Effect.runPromise(Deferred.make<void>());
  const started = await Effect.runPromise(Deferred.make<void>());
  let releases = 0;
  const task = Effect.acquireUseRelease(Effect.succeed(42), () => Effect.gen(function* () { yield* Deferred.succeed(started, undefined); yield* Deferred.await(gate); }), () => Effect.sync(() => { releases++; }));
  const fiber = await Effect.runPromise(factory(task));
  await Effect.runPromise(Deferred.await(started));
  if (releases !== 0 || !(Option.isNone(await Effect.runPromise(Fiber.poll(fiber))))) throw new Error("Detached lifecycle counterexample did not execute");
  assertInterrupted(await Effect.runPromise(Fiber.interrupt(fiber)));
  if (Number(releases) !== 1) throw new Error("Explicit detached teardown did not finalize once");
  await Effect.runPromise(Deferred.interrupt(gate));
}
for (const kind of ["scoped", "in", "child"] as const) {
  const started = await Effect.runPromise(Deferred.make<void>());
  let releases = 0;
  const task = Effect.acquireUseRelease(Effect.succeed(42), () => Effect.gen(function* () { yield* Deferred.succeed(started, undefined); yield* Effect.never; }), () => Effect.sync(() => { releases++; }));
  const fiber = await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const fiber = yield* (kind === "in" ? backgroundGood.inScope(task, scope) : kind === "child" ? backgroundGood.child(task) : backgroundGood.scoped(task));
    yield* Deferred.await(started);
    return fiber;
  })));
  assertInterrupted(await Effect.runPromise(Fiber.await(fiber)));
  if (releases !== 1) throw new Error("Owned child did not finalize on scope/parent completion");
}
// Resource-shaped stand-ins count actual release; no filesystem/network effects are needed.
for (const repaired of [false, true]) for (const mode of ["value", "failure", "interrupt"] as const) {
  const gate = await Effect.runPromise(Deferred.make<number, typeof original>());
  let publish: (connection: Connection) => void = () => { throw new Error("Registration missing"); };
  const registration = new Promise<Connection>(resolve => { publish = resolve; });
  const connection = await Effect.runPromise(Effect.gen(function* () {
    const fiber = yield* (repaired ? resourceGood.owned(publish, gate, connection => connection.close()) : resourceBad.fork(publish, gate));
    const connection = yield* Effect.promise(() => registration);
    if (mode === "value") yield* Deferred.succeed(gate, 1);
    else if (mode === "failure") yield* Deferred.fail(gate, original);
    else yield* Fiber.interrupt(fiber);
    const exit = yield* Fiber.await(fiber);
    if (mode === "value") { if (!Exit.isSuccess(exit) || exit.value !== 43) throw new Error("Resource result changed"); }
    else if (mode === "failure") assertFailure(exit);
    else assertInterrupted(exit);
    return connection;
  }));
  if (connection.closes !== (repaired ? 1 : 0) || connection.closed !== repaired) throw new Error("Resource ownership counterexample changed");
  if (!repaired) await Effect.runPromise(connection.close());
  await Effect.runPromise(Deferred.interrupt(gate));
}
for (const factory of [resourceGood.scopedAcquire, resourceGood.finalized, resourceGood.markerOnly]) {
  const opened: Connection[] = [];
  await Effect.runPromise(Effect.gen(function* () { const fiber: Fiber.Fiber<unknown> = yield* factory(connection => { opened.push(connection); }); yield* Fiber.join(fiber); }));
  if (opened.length !== 1 || opened[0]!.closes !== (factory === resourceGood.markerOnly ? 0 : 1)) throw new Error("Scope marker/release contract changed");
  if (factory === resourceGood.markerOnly) await Effect.runPromise(opened[0]!.close());
}
// The imported acquisition is real typed Effect work, not a fabricated resource cast.
const clean = await Effect.runPromise(openConnection(() => {}));
await Effect.runPromise(clean.close());
