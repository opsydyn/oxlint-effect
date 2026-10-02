import { Cause, Deferred, Effect, Exit, Fiber } from "effect";
import * as nestingBad from "./no-nested-acquire-release.bad";
import * as nestingGood from "./no-nested-acquire-release.good";
import * as runBad from "./no-run-with-open-resource.bad";
import * as runGood from "./no-run-with-open-resource.good";
import * as provisionBad from "./no-missing-layer-provision-at-run.bad";
import * as provisionGood from "./no-missing-layer-provision-at-run.good";
import { releases } from "./nesting-support";
import { DatabasePool, instances } from "./pool-support";

const original = { _tag: "Q24Failure", value: 42 };
function assertFailure(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const error = Cause.failureOption(exit.cause);
  if (error._tag !== "Some" || error.value !== original) throw new Error("Original failure identity changed");
}
function assertInterrupted(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit) || !(Cause.isInterrupted(exit.cause))) throw new Error("Interruption disappeared");
}
for (const factory of [nestingBad.nested, nestingGood.composed]) for (const mode of ["value", "failure", "interrupt"] as const) {
  const before = instances.length;
  releases.length = 0;
  const ready = await Effect.runPromise(Deferred.make<void>());
  const gate = await Effect.runPromise(Deferred.make<number, typeof original>());
  const task = factory(pools => Effect.gen(function* () { yield* Deferred.succeed(ready, undefined); const delta = yield* Deferred.await(gate); return pools.reduce((sum, pool) => sum + pool.read(), delta); }));
  const fiber = Effect.runFork(task);
  await Effect.runPromise(Deferred.await(ready));
  if (instances.length !== before + 3 || instances.slice(before).some(pool => pool.closed)) throw new Error("Nested acquisition changed");
  if (mode === "value") await Effect.runPromise(Deferred.succeed(gate, 1));
  else if (mode === "failure") await Effect.runPromise(Deferred.fail(gate, original));
  else await Effect.runPromise(Fiber.interrupt(fiber));
  const exit = await Effect.runPromise(Fiber.await(fiber));
  if (mode === "value") { if (!Exit.isSuccess(exit) || exit.value !== 127) throw new Error("Named composition changed result"); }
  else if (mode === "failure") assertFailure(exit);
  else assertInterrupted(exit);
  if (releases.join(",") !== "third,second,first" || instances.slice(before).some(pool => pool.closes !== 1)) throw new Error("Reverse release order or once-only cleanup changed");
  await Effect.runPromise(Deferred.interrupt(gate));
}
{
  if ((await Effect.runPromise(nestingBad.legacy())) !== 42) throw new Error("Acquisition API result changed");
  const values = await Effect.runPromise(nestingBad.siblings());
  if (values[0] !== 1 || values[1] !== 2) throw new Error("Sibling threshold control changed");
  if ((await Effect.runPromise(nestingGood.two())) !== 42) throw new Error("Two-owner clean threshold changed");
}
for (const repaired of [false, true]) for (const mode of ["value", "failure", "interrupt"] as const) {
  const ready = await Effect.runPromise(Deferred.make<void>());
  const gate = await Effect.runPromise(Deferred.make<number, typeof original>());
  const wait = Effect.gen(function* () { yield* Deferred.succeed(ready, undefined); return yield* Deferred.await(gate); });
  const pending = repaired ? runGood.gated(wait) : runBad.gated(wait);
  await Effect.runPromise(Deferred.await(ready));
  const pool = instances.at(-1);
  if (!pool || pool.closed) throw new Error("Runner did not acquire a live pool");
  if (mode === "value") await Effect.runPromise(Deferred.succeed(gate, 1));
  else if (mode === "failure") await Effect.runPromise(Deferred.fail(gate, original));
  else await Effect.runPromise(Deferred.interrupt(gate));
  const exit = await pending;
  if (mode === "value") { if (!Exit.isSuccess(exit) || exit.value !== 43) throw new Error("Run result changed"); }
  else if (mode === "failure") assertFailure(exit);
  else assertInterrupted(exit);
  if (pool.closes !== (repaired ? 1 : 0)) throw new Error("Runner open-resource counterexample changed");
  if (!repaired) pool.close();
  await Effect.runPromise(Deferred.interrupt(gate));
}
for (const factory of [runBad.runPromise, runBad.runSync, runBad.scopedRun, runBad.constructed]) {
  const before = instances.length;
  if ((await factory()) !== 42) throw new Error("Raw run result changed");
  const pool = instances.at(-1);
  if (!pool || instances.length !== before + 1 || pool.closes !== 0) throw new Error("Raw run did not leave its resource open");
  pool.close();
}
if (runBad.afterRun() !== 42 || instances.at(-1)?.closes !== 1) throw new Error("Lexical after-run false positive changed");
for (const factory of [runGood.owned, provisionGood.owned, provisionGood.named, provisionGood.piped]) {
  const before = instances.length;
  if ((await factory()) !== 42) throw new Error("Managed run/provision result changed");
  const pool = instances.at(-1);
  if (!pool || instances.length !== before + 1 || pool.closes !== 1) throw new Error("Managed run/provision did not close exactly once");
}
if ((await provisionBad.runPromise()) !== 42 || (await provisionBad.named()) !== 42 || (await provisionBad.unused()) !== 42 || (await provisionBad.shadowed()) !== 42) throw new Error("Naming/legacy traversal counterexamples changed");
const opaque = runGood.opaque();
if (opaque.closed) throw new Error("Opaque factory counterexample changed");
opaque.close();
