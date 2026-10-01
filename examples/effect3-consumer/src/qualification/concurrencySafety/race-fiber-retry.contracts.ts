import { Deferred, Effect, Exit, Fiber, Cause } from "effect";
import * as raceBad from "./no-race-without-cleanup.bad";
import * as raceGood from "./no-race-without-cleanup.good";
import * as fiberBad from "./no-unobserved-fiber.bad";
import * as fiberGood from "./no-unobserved-fiber.good";
import * as retryBad from "./no-unbounded-concurrent-retry.bad";
import * as retryGood from "./no-unbounded-concurrent-retry.good";
const original = { _tag: "Q17Failure", value: 42 };
function assertFailure(exit: Exit.Exit<unknown, typeof original>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const failure = Cause.failureOption(exit.cause);
  if (failure._tag !== "Some" || failure.value !== original) throw new Error("Original failure identity changed");
}
// Race interruption alone cannot close a resource with no registered finalizer.
for (const pair of [[raceBad.two, raceGood.two], [raceBad.many, raceGood.many]] as const) {
  for (const repaired of [false, true]) {
    const started = await Effect.runPromise(Deferred.make<void>());
    let open = false;
    let releases = 0;
    const loser = Effect.gen(function* () {
      open = true;
      yield* Deferred.succeed(started, undefined);
      return yield* Effect.never;
    });
    const winner = Effect.gen(function* () { yield* Deferred.await(started); return 42; });
    const cleanup = Effect.sync(() => { if (!open) throw new Error("Double release"); open = false; releases++; });
    const program = repaired ? pair[1](winner, loser, cleanup) : pair[0](winner, loser);
    if (await Effect.runPromise(program) !== 42) throw new Error("Race repair changed winner");
    if (repaired) {
      if (open || releases !== 1) throw new Error("Interrupted loser was not released once");
    } else {
      if (!open || releases !== 0) throw new Error("Bare loser unexpectedly released a resource");
      await Effect.runPromise(cleanup);
    }
  }
}
for (const program of [raceGood.boundary, raceGood.resource, raceGood.firstNotTracked]) {
  if (await Effect.runPromise(program) !== 42) throw new Error("Race boundary result changed");
}
assertFailure(await Effect.runPromiseExit(raceGood.two(Effect.fail(original), Effect.fail(original), Effect.void)));
if (await Effect.runPromise(Effect.race(Effect.fail(original), Effect.succeed(42))) !== 42) throw new Error("Success race settled on failure");

for (const program of [fiberGood.joined, fiberGood.pipedJoin, fiberGood.scoped]) {
  if (await Effect.runPromise(program) !== 42) throw new Error("Fiber result changed");
}
for (const make of [fiberBad.direct, fiberBad.second, fiberBad.third]) {
  const result = await Effect.runPromise(Effect.gen(function* () { const handle = yield* make(); return yield* Fiber.join(handle); }));
  if (result !== 42) throw new Error("Legacy lazy source result changed");
}
for (const program of [fiberGood.awaited, fiberGood.functionalAwait]) {
  const exit = await Effect.runPromise(program);
  if (!Exit.isSuccess(exit) || exit.value !== 42) throw new Error("Await result changed");
}
if (!Exit.isFailure(await Effect.runPromise(fiberGood.interrupted))) throw new Error("Interrupt did not settle fiber");
assertFailure(await Effect.runPromiseExit(fiberGood.failure(original)));
assertFailure(await Effect.runPromise(fiberGood.failureAwait(original)));
// An observed interruption releases an actually acquired child resource once.
await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
  const started = yield* Deferred.make<void>();
  let acquired = 0;
  let released = 0;
  const task = Effect.scoped(Effect.gen(function* () {
    const resource = yield* Effect.acquireRelease(Effect.sync(() => { acquired++; return { value: 42 }; }), () => Effect.sync(() => { released++; }));
    if (resource.value !== 42) throw new Error("Acquired resource changed");
    yield* Deferred.succeed(started, undefined);
    yield* Effect.never;
  }));
  const fiber = yield* Effect.fork(task);
  yield* Deferred.await(started);
  yield* Fiber.interrupt(fiber);
  const exit = yield* Fiber.await(fiber);
  if (!Exit.isFailure(exit) || acquired !== 1 || released !== 1) throw new Error("Interrupted resource was not released once");
})));
for (const corpus of [retryBad, retryGood]) {
  for (const collect of [corpus.mapped, corpus.forEach, corpus.piped, corpus.opaque]) {
    const attempts = new Map<number, number>();
    const work = (value: number) => Effect.suspend(() => {
      const attempt = (attempts.get(value) ?? 0) + 1;
      attempts.set(value, attempt);
      return attempt === 1 ? Effect.fail(original) : Effect.succeed(value * 2);
    });
    if ((await Effect.runPromise(collect(work))).join(",") !== "2,4,6" || [...attempts.values()].some(count => count !== 2)) throw new Error("Retry budget or ordered results changed");
    assertFailure(await Effect.runPromiseExit(collect(() => Effect.fail(original))));
  }
}
// Bound retry work with a handshake, not scheduler timing thresholds.
await Effect.runPromise(Effect.gen(function* () {
  const reached = yield* Deferred.make<void>();
  const release = yield* Deferred.make<void>();
  const attempts = new Map<number, number>();
  let active = 0;
  let peak = 0;
  const work = (value: number) => Effect.gen(function* () {
    active++; peak = Math.max(peak, active);
    const attempt = (attempts.get(value) ?? 0) + 1;
    attempts.set(value, attempt);
    if (active === 2) yield* Deferred.succeed(reached, undefined);
    yield* Deferred.await(release);
    return yield* (attempt === 1 ? Effect.fail(original) : Effect.succeed(value));
  }).pipe(Effect.ensuring(Effect.sync(() => { active--; })));
  const handle = yield* Effect.fork(retryGood.forEach(work));
  yield* Deferred.await(reached);
  const activeCount = () => active;
  if (activeCount() !== 2) throw new Error("Retry workers did not reach budget");
  yield* Deferred.succeed(release, undefined);
  const values = yield* Fiber.join(handle);
  if (peak !== 2 || active !== 0 || values.join(",") !== "1,2,3" || [...attempts.values()].some(count => count !== 2)) throw new Error("Retry concurrency or cleanup changed");
}));
