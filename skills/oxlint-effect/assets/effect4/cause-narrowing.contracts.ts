// Effect 4 packaged review/repair runtime contracts.
import { Effect, Exit, Result } from "effect";
import * as bad from "./cause-narrowing.bad";
import * as good from "./cause-narrowing.good";

const check = (valid: boolean, message: string) => { if (!valid) throw new Error(message); };
const secret = { credential: "fixture-secret" };
const original = new good.ProviderFailure({ code: 503, cause: secret });
for (const [erasing, preserving] of [[bad.mapProfile, good.mapProfile], [bad.recoverProfile, good.recoverProfile]] as const) {
  const lost = Effect.runSync(Effect.flip(erasing(Effect.fail(original))));
  const retained = Effect.runSync(Effect.flip(preserving(Effect.fail(original))));
  // Tag-only assertions would accept both outcomes and miss the regression.
  check(lost._tag === retained._tag && lost.operation === retained.operation, "Boundary discriminator changed");
  check(!Object.hasOwn(lost, "cause"), "Erasure counterexample no longer erases");
  check(retained.cause === original && retained.cause.cause === secret, "Original cause identity lost");
  check(Effect.runSync(preserving(Effect.succeed(42))) === 42, "Successful value changed");
  check(JSON.stringify(good.toPublicFailure(retained)) === '{"_tag":"ProfileBoundaryFailure","operation":"profile.load"}', "Internal cause leaked to public projection");
}

const captured: good.ProviderFailure[] = [];
const capture = (error: good.ProviderFailure) => Effect.sync(() => { captured.push(error); });
Effect.runSync(Effect.flip(bad.captureAndMap(Effect.fail(original), capture)));
check(captured.length === 0, "Unsequenced capture unexpectedly executed");
const observed = Effect.runSync(Effect.flip(good.captureAndMap(Effect.fail(original), capture)));
check(captured.length === 1 && captured[0] === original && observed.cause === original, "Capture or mapping lost the original");
check(Effect.runSync(good.captureAndMap(Effect.succeed(42), capture)) === 42 && captured.length === 1, "Success invoked the failure observer");

for (const value of [undefined, null, false, 0, -0, NaN, 1n, "failure", Symbol("failure"), () => 1]) {
  const supplied = new good.ProviderFailure({ code: 503, cause: value });
  check(Object.is(Effect.runSync(Effect.flip(good.mapProfile(Effect.fail(supplied)))).cause.cause, value), "Unknown cause was fabricated or discarded");
}
const defect = { source: "defect" };
const died = Effect.runSyncExit(good.mapProfile(Effect.die(defect)));
if (!Exit.isFailure(died)) throw new Error("Typed mapping swallowed a defect");
const diedWith = Exit.findDefect(died);
check(Result.isSuccess(diedWith) && diedWith.success === defect, "Typed mapping changed a defect");
const interrupted = Effect.runSyncExit(good.mapProfile(Effect.interrupt));
check(Exit.isFailure(interrupted) && Exit.hasInterrupts(interrupted) && !Exit.hasFails(interrupted) && !Exit.hasDies(interrupted), "Typed mapping swallowed interruption");
const reporterDefect = { source: "reporter" };
const brokenObserver = Effect.runSyncExit(good.captureAndMap(Effect.fail(original), () => Effect.die(reporterDefect)));
if (!Exit.isFailure(brokenObserver)) throw new Error("Observer failure became success");
const observerDiedWith = Exit.findDefect(brokenObserver);
check(Result.isSuccess(observerDiedWith) && observerDiedWith.success === reporterDefect, "Observer failure was concealed");
