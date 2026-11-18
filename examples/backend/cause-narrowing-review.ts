// Legacy reference app. Effect 4 counterparts live in skills/oxlint-effect/assets/effect4.
import { Effect } from "effect";
import * as bad from "../../skills/oxlint-effect/assets/cause-narrowing.bad";
import * as good from "../../skills/oxlint-effect/assets/cause-narrowing.good";

const original = new good.ProviderFailure({ code: 503, cause: { trace: "private fixture" } });
// EXPECT: linteffect/no-error-cause-loss
// A matching error tag is not evidence that the original failure was retained.
export const lostCause = Effect.mapError(Effect.fail(original), () => new bad.ErasedProfileFailure({ operation: "profile.load" }));
// Clean repair: retains the exact original failure; public projection is separate.
export const retainedCause = good.mapProfile(Effect.fail(original));
// EXPECT: linteffect/no-error-cause-loss
// Reading/logging the original does not retain it in this new failure.
export const missedCapture = Effect.mapError(Effect.fail(original), error => {
  Effect.logError(error);
  return new bad.ErasedProfileFailure({ operation: "profile.load" });
});
export const sequencedCapture = good.captureAndMap(Effect.fail(original), () => Effect.void);
