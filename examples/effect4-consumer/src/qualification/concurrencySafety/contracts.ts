import { Deferred, Effect, Exit, Fiber } from "effect";
import * as allBad from "./no-unbounded-effect-all.bad";
import * as allGood from "./no-unbounded-effect-all.good";
import * as forkBad from "./no-fire-and-forget-fork.bad";
import * as forkGood from "./no-fire-and-forget-fork.good";
import * as loopBad from "./no-fork-in-loop.bad";
import * as loopGood from "./no-fork-in-loop.good";
for (const program of [allBad.mapped, allGood.mapped]) {
  if ((await Effect.runPromise(program)).join(",") !== "2,4,6") throw new Error("Scheduling repair changed ordered results");
}
for (const program of [allBad.opaque, allGood.opaque, allGood.quoted, allGood.storedInput, allGood.explicitUnbounded]) {
  if ((await Effect.runPromise(program)).join(",") !== "1,2,3") throw new Error("Collection control changed values");
}
await Effect.runPromise(allBad.discarded);
await Effect.runPromise(allGood.discarded);
const original = { _tag: "Q16Failure", payload: 42 };
function assertFailure(exit: Exit.Exit<unknown, typeof original>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure was swallowed");
  const failure = Exit.findErrorOption(exit);
  if (failure._tag !== "Some" || failure.value !== original) throw new Error("Failure identity changed");
}
for (const program of [allBad.failing(original), allGood.failing(original), forkGood.failing(original)]) assertFailure(await Effect.runPromiseExit(program));
let lazyExecutions = 0;
forkBad.discardedConstructors(Effect.sync(() => ++lazyExecutions));
if (lazyExecutions !== 0) throw new Error("Discarded fork constructor executed lazy work");
for (const program of [forkGood.joined, forkGood.scoped, loopGood.single, loopGood.scoped, forkBad.child, forkBad.detached, forkBad.pipedChild, forkBad.pipedDetached, forkBad.curriedChild, forkBad.curriedDetached, forkGood.pipedJoin, forkGood.detachedJoin, forkGood.curriedChild, forkGood.curriedDetached]) {
  if (await Effect.runPromise(program) !== 42) throw new Error("Fork ownership result changed");
}
for (const cases of [loopBad, loopGood]) {
  for (const program of [cases.counted, cases.values, cases.keys, cases.whileLoop, cases.doLoop]) {
    if ((await Effect.runPromise(program)).join(",") !== "1,2,3") throw new Error("Loop repair lost results");
  }
}
// Deterministic coordination: two workers enter, then the owner opens the gate.
await Effect.runPromise(Effect.gen(function* () {
  const reached = yield* Deferred.make<void>();
  const release = yield* Deferred.make<void>();
  let active = 0;
  let peak = 0;
  const work = (value: number) => Effect.gen(function* () {
    active++;
    peak = Math.max(peak, active);
    if (active === 2) yield* Deferred.succeed(reached, undefined);
    yield* Deferred.await(release);
    return value;
  }).pipe(Effect.ensuring(Effect.sync(() => { active--; })));
  const fiber = yield* Effect.forkChild(allGood.collect(work));
  yield* Deferred.await(reached);
  const activeCount = () => active;
  if (activeCount() !== 2) throw new Error("Bounded collection did not reach its budget");
  yield* Deferred.succeed(release, undefined);
  const values = yield* Fiber.join(fiber);
  if (peak !== 2 || active !== 0 || values.join(",") !== "1,2,3") throw new Error("Collection budget or teardown changed");
}));
// Omitted options are sequential, despite the explicit-policy diagnostic.
await Effect.runPromise(Effect.gen(function* () {
  let active = 0;
  let peak = 0;
  const values = yield* allBad.collect(value => Effect.gen(function* () {
    active++;
    peak = Math.max(peak, active);
    yield* Effect.yieldNow;
    active--;
    return value;
  }));
  if (peak !== 1 || active !== 0 || values.join(",") !== "1,2,3") throw new Error("Default collection is not sequential");
}));
// Parent termination and scope closure must interrupt a started child exactly once.
for (const mode of ["child", "scoped", "in", "detached"] as const) {
  const started = await Effect.runPromise(Deferred.make<void>());
  const closed = await Effect.runPromise(Deferred.make<void>());
  let finalizers = 0;
  const task = Effect.gen(function* () {
    yield* Deferred.succeed(started, undefined);
    yield* Effect.never;
  }).pipe(Effect.ensuring(Effect.gen(function* () {
    finalizers++;
    yield* Deferred.succeed(closed, undefined);
  })));
  const owner = Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const fiber = yield* (mode === "scoped" ? Effect.forkScoped(task) : mode === "in" ? Effect.forkIn(task, scope) : mode === "child" ? Effect.forkChild(task) : Effect.forkDetach(task));
    yield* Deferred.await(started);
    return fiber;
  });
  const fiber = await Effect.runPromise(Effect.scoped(owner));
  if (mode === "detached") {
    if (finalizers !== 0) throw new Error("Detached fiber inherited owner lifetime");
    await Effect.runPromise(Fiber.interrupt(fiber));
  }
  await Effect.runPromise(Deferred.await(closed));
  const exit = await Effect.runPromise(Fiber.await(fiber));
  if (!Exit.isFailure(exit) || finalizers !== 1) throw new Error("Fiber teardown missing or duplicated");
}
