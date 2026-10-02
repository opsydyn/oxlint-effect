import { Cause, Deferred, Effect, Exit } from "effect";
import { original } from "./failure";
const started = await Effect.runPromise(Deferred.make<void>());
const gate = await Effect.runPromise(Deferred.make<number>());
const finished = await Effect.runPromise(Deferred.make<void>());
const task = Effect.gen(function* () { yield* Deferred.succeed(started, undefined); const value = yield* Deferred.await(gate); yield* Deferred.succeed(finished, undefined); return value; });
let pending: Promise<number> | undefined;
// Mirrors a discarded test body while retaining its promise for deterministic teardown.
function discardedBody() { pending = Effect.runPromise(task); }
const result = discardedBody();
await Effect.runPromise(Deferred.await(started));
if (result !== undefined || await Effect.runPromise(Deferred.isDone(finished))) throw new Error("Discarded body unexpectedly owns completion");
await Effect.runPromise(Deferred.succeed(gate, 42));
if (!pending || await pending !== 42 || !await Effect.runPromise(Deferred.isDone(finished))) throw new Error("Discarded task teardown failed");
const repaired = () => Effect.runPromise(Effect.succeed(42));
if (await repaired() !== 42) throw new Error("Returned-runner repair changed value");
if (await Effect.runPromise(Effect.flip(Effect.fail(original))) !== original) throw new Error("Flip lost typed failure identity");
const defect = await Effect.runPromiseExit(Effect.flip(Effect.die(original)));
if (!Exit.isFailure(defect) || !(Cause.isDie(defect.cause))) throw new Error("Flip incorrectly recovered a defect");

// The packed harness also runs the real Bun test fixture files; no test DSL is fabricated.
