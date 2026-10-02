import { Cause, Deferred, Effect, Exit, Fiber, Scope } from "effect";
import * as manualBad from "./no-manual-resource-close.bad";
import * as manualGood from "./no-manual-resource-close.good";
import * as scopeBad from "./no-unbound-scope.bad";
import * as scopeGood from "./no-unbound-scope.good";
import * as escapeBad from "./no-resource-succeed-escape.bad";
import * as escapeGood from "./no-resource-succeed-escape.good";
import { makeClient } from "./support";
const original = { _tag: "Q22Failure", value: 42 };
function assertFailure(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const error = Cause.failureOption(exit.cause);
  if (error._tag !== "Some" || error.value !== original) throw new Error("Original failure identity changed");
}
function assertInterrupted(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit) || !(Cause.isInterrupted(exit.cause))) throw new Error("Interruption disappeared");
}
// Real typed stand-ins; no network/filesystem or whole-program lifetime claims.
for (const kind of ["resource", "manualScope", "registered"] as const) for (const mode of ["value", "failure", "interrupt"] as const) {
  const client = makeClient();
  const ready = await Effect.runPromise(Deferred.make<void>());
  const gate = await Effect.runPromise(Deferred.make<number, typeof original>());
  const use = Effect.gen(function* () { yield* Deferred.succeed(ready, undefined); return client.value + (yield* Deferred.await(gate)); });
  const release = Effect.sync(() => client.close());
  const program = kind === "resource"
    ? Effect.acquireUseRelease(Effect.sync(() => client), () => use, () => release)
    : kind === "manualScope"
    ? Effect.acquireUseRelease(Scope.make(), scope => Effect.gen(function* () { yield* Scope.addFinalizer(scope, release); return yield* use; }), (scope, exit) => Scope.close(scope, exit))
    : Effect.scoped(Effect.gen(function* () { const scope = yield* Effect.scope; yield* Scope.addFinalizer(scope, release); return yield* use; }));
  const fiber = Effect.runFork(program);
  await Effect.runPromise(Deferred.await(ready));
  if (client.closed || client.closes !== 0) throw new Error("Resource closed before use");
  if (mode === "value") await Effect.runPromise(Deferred.succeed(gate, 1));
  else if (mode === "failure") await Effect.runPromise(Deferred.fail(gate, original));
  else await Effect.runPromise(Fiber.interrupt(fiber));
  const exit = await Effect.runPromise(Fiber.await(fiber));
  if (mode === "value") { if (!Exit.isSuccess(exit) || exit.value !== 43) throw new Error("Value changed"); }
  else if (mode === "failure") assertFailure(exit);
  else assertInterrupted(exit);
  if (!client.closed || Number(client.closes) !== 1) throw new Error("Release did not execute exactly once");
  await Effect.runPromise(Deferred.interrupt(gate));
}
for (const factory of [manualGood.owned, manualGood.scoped, manualGood.finalizer, manualGood.interruptible, manualBad.curried]) {
  const client = makeClient();
  await Effect.runPromise(factory(client));
  if (client.closes !== 1 || !client.closed) throw new Error("Clean release variant failed");
}
{
  const client = makeClient();
  await Effect.runPromise(manualBad.prematurelyClosed(client));
  if (client.closes !== 2) throw new Error("Manual use cleanup did not reproduce double release");
}
for (const factory of [manualGood.exitFinalizer, manualBad.registered]) {
  const client = makeClient();
  const scope = await Effect.runPromise(Scope.make());
  await Effect.runPromise(factory(scope, client));
  if (client.closes !== 0) throw new Error("Finalizer registration ran eagerly");
  await Effect.runPromise(Scope.close(scope, Exit.succeed(42)));
  await Effect.runPromise(Scope.close(scope, Exit.succeed(42)));
  if (Number(client.closes) !== 1) throw new Error("Repeated scope close double-released");
}
for (const factory of [scopeGood.owned, scopeGood.acquired, scopeGood.explicit, scopeGood.supplied]) {
  await Effect.runPromise(factory());
}
// Scope markers and close-expression presence do not prove actual manual scope teardown.
for (const factory of [scopeGood.markerOnly, scopeGood.lazyClose, scopeBad.unowned]) {
  const client = makeClient();
  const scope = await Effect.runPromise(factory());
  await Effect.runPromise(Scope.addFinalizer(scope, Effect.sync(() => client.close())));
  if (client.closes !== 0) throw new Error("Manual scope was unexpectedly closed");
  await Effect.runPromise(Scope.close(scope, Exit.succeed(undefined)));
  if (Number(client.closes) !== 1) throw new Error("Explicit counterexample teardown failed");
}
{
  const client = await Effect.runPromise(escapeBad.scopedEscape());
  if (!client.closed || client.closes !== 1) throw new Error("Escaped scoped handle was not closed");
  if ((await Effect.runPromise(escapeGood.data())) !== 42) throw new Error("Data repair changed value");
  const live = makeClient();
  if ((await Effect.runPromise(escapeBad.dataField(live))) !== 42) throw new Error("Receiver-shaped immutable result changed");
  if ((await Effect.runPromise(escapeGood.alias(live))) !== live || live.closed) throw new Error("Opaque alias counterexample changed");
  if ((await Effect.runPromise(escapeBad.ownedUse(live))) !== live || live.closed) throw new Error("Strict owned-use counterexample changed");
  live.close();
}
