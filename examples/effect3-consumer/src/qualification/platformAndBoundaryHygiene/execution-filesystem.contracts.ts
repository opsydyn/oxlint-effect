import { Cause, Deferred, Effect, Exit, Fiber } from "effect";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as hidden from "./no-hidden-effect-execution.bad";
import * as hiddenGood from "./no-hidden-effect-execution.good";
import * as boundary from "./server/no-hidden-effect-execution.good";
import * as raw from "./server/no-boundary-try-catch-without-effect-map.bad";
import * as repaired from "./server/no-boundary-try-catch-without-effect-map.good";
import * as fsBad from "./no-node-fs-in-effect-code.bad";
import * as fsGood from "./no-node-fs-in-effect-code.good";
if (await hidden.runPromise() !== 42 || hidden.runSync() !== 42 || hiddenGood.opaque() !== 42 || await boundary.atBoundary() !== 42 || await Effect.runPromise(hiddenGood.program) !== 42) throw new Error("Execution ownership changed result");
for (const exit of [await hidden.runPromiseExit(), hidden.runSyncExit(), await Effect.runPromise(Fiber.await(hidden.runFork()))]) if (!Exit.isSuccess(exit) || exit.value !== 42) throw new Error("Runner result changed");
await new Promise<void>((resolve, reject) => { hidden.runCallback(exit => { if (Exit.isSuccess(exit) && exit.value === 42) resolve(); else reject(new Error("Callback runner result changed")); }); });

function failure(exit: Exit.Exit<unknown, unknown>) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const error = Cause.failureOption(exit.cause);
  if (error._tag !== "Some" || error.value !== raw.original) throw new Error("Original failure identity changed");
}
failure(await Effect.runPromiseExit(repaired.mapped()));
failure(await Effect.runPromiseExit(repaired.promise()));
if (await Effect.runPromise(repaired.recovered()) !== raw.original || await Effect.runPromise(repaired.tagged()) !== raw.original || repaired.unusedMarker() !== raw.original) throw new Error("Recovery/marker counterexample changed");
if (Object.is(raw.raw(), raw.original) || Object.is(await raw.promise(), raw.original)) throw new Error("Raw catch did not erase original error identity");
const ready = await Effect.runPromise(Deferred.make<void>());
const gate = await Effect.runPromise(Deferred.make<void>());
const task = Effect.gen(function* () { yield* Deferred.succeed(ready, undefined); yield* Deferred.await(gate); return 42; });
const fiber = Effect.runFork(Effect.mapError(task, error => error));
await Effect.runPromise(Deferred.await(ready));
const interrupted = await Effect.runPromise(Fiber.interrupt(fiber));
if (!Exit.isFailure(interrupted) || !(Cause.isInterrupted(interrupted.cause))) throw new Error("Mapped interruption changed");
await Effect.runPromise(Deferred.interrupt(gate));
if (await Effect.runPromise(Effect.provide(fsGood.read("fixture"), fsGood.testLayer)) !== "42") throw new Error("FileSystem repair changed result");
const dir = await mkdtemp(join(tmpdir(), "q25-fs-"));
try {
  const path = join(dir, "fixture");
  await writeFile(path, "42");
  for (const fs of fsBad.readers) if (fs.readFileSync(path, "utf8") !== "42") throw new Error("Node import/require reader changed");
  for (const fs of fsBad.asyncReaders) if (await fs.readFile(path, "utf8") !== "42") throw new Error("Promise import/require reader changed");
  if (await Effect.runPromise(fsBad.syncRead(path)) !== "42" || await Effect.runPromise(fsBad.asyncRead(path)) !== "42" || fsGood.opaque().readFileSync(path, "utf8") !== "42") throw new Error("Wrapped/opaque reader changed");
  const missing = await Effect.runPromiseExit(fsBad.asyncRead(join(dir, "missing")));
  if (!Exit.isFailure(missing)) throw new Error("Missing-file failure disappeared");
  if (await readFile(path, "utf8") !== "42") throw new Error("Fixture mutated");
} finally { await rm(dir, { recursive: true, force: true }); }
// FileSystem.layerNoop checks the service seam, not native adapter cancellation.
