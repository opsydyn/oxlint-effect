import { Cause, Deferred, Effect, Exit, Fiber } from "effect";
import * as raw from "./no-resource-without-acquire-release.bad";
import * as owned from "./no-resource-without-acquire-release.good";
import * as requests from "./no-request-scoped-long-lived-resource.bad";
import * as requestGood from "./no-request-scoped-long-lived-resource.good";
import * as globals from "./no-global-resource-singleton.bad";
import * as globalGood from "./no-global-resource-singleton.good";
import { DatabasePool, instances } from "./pool-support";
import { PoolLive, PoolService } from "./pool-layer";
const original = { _tag: "Q23Failure", value: 42 };
function assertFailure(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const error = Cause.failureOption(exit.cause);
  if (error._tag !== "Some" || error.value !== original) throw new Error("Original failure changed");
}
function assertInterrupted(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit) || !(Cause.isInterrupted(exit.cause))) throw new Error("Interruption disappeared");
}
// Module constructors are eagerly live; hiding one behind an alias does not repair ownership.
for (const pool of [globals.client, globals.pool, globals.connection, globals.blockPool, globals.Registry.client, globalGood.aliased]) {
  if (pool.closed || pool.closes !== 0 || pool.read() !== 42) throw new Error("Global counterexample changed");
  pool.close();
}
for (const kind of ["raw", "owned", "layer"] as const) for (const mode of ["value", "failure", "interrupt"] as const) {
  const ready = await Effect.runPromise(Deferred.make<void>());
  const gate = await Effect.runPromise(Deferred.make<number, typeof original>());
  const use = (pool: DatabasePool) => Effect.gen(function* () { yield* Deferred.succeed(ready, undefined); return pool.read() + (yield* Deferred.await(gate)); });
  const program = kind === "raw" ? Effect.flatMap(raw.open(), use)
    : kind === "owned" ? Effect.acquireUseRelease(raw.open(), use, pool => Effect.sync(() => pool.close()))
    : Effect.provide(Effect.flatMap(PoolService, use), PoolLive);
  const fiber = Effect.runFork(program);
  await Effect.runPromise(Deferred.await(ready));
  const pool = instances.at(-1);
  if (!pool || pool.closed) throw new Error("Acquisition was not live during use");
  if (mode === "value") await Effect.runPromise(Deferred.succeed(gate, 1));
  else if (mode === "failure") await Effect.runPromise(Deferred.fail(gate, original));
  else await Effect.runPromise(Fiber.interrupt(fiber));
  const exit = await Effect.runPromise(Fiber.await(fiber));
  if (mode === "value") { if (!Exit.isSuccess(exit) || exit.value !== 43) throw new Error("Acquisition result changed"); }
  else if (mode === "failure") assertFailure(exit);
  else assertInterrupted(exit);
  if (pool.closes !== (kind === "raw" ? 0 : 1) || pool.closed !== (kind !== "raw")) throw new Error("Acquisition release count changed");
  if (kind === "raw") pool.close();
  await Effect.runPromise(Deferred.interrupt(gate));
}
{
  const first = requests.requestHandler();
  const second = requests.route();
  if (first === second || first.closed || second.closed) throw new Error("Per-request construction counterexample changed");
  first.close(); second.close();
  const before = instances.length;
  const values = await Effect.runPromise(Effect.provide(Effect.all([requestGood.requestHandler(), requestGood.endpoint()]), PoolLive));
  const pool = instances.at(-1);
  if (!pool || instances.length !== before + 1 || values.length !== 2 || values.some(value => value !== 42) || pool.closes !== 1) throw new Error("Application layer was not shared across requests");
}
for (const factory of [owned.owned, owned.acquired, owned.interruptible]) {
  const before = instances.length;
  const program: Effect.Effect<unknown> = factory();
  await Effect.runPromise(program);
  const pool = instances.at(-1);
  if (!pool || instances.length !== before + 1 || pool.closes !== 1) throw new Error("Owned fixture failed actual cleanup");
}
for (const factory of [owned.markerOnly, owned.pipeMarker, owned.generic, owned.computed]) {
  const pool = await Effect.runPromise(factory());
  if (pool.closed || pool.closes !== 0) throw new Error("Naming/scope marker limitation changed");
  pool.close();
}
