// Legacy reference app. Effect 4 counterparts live in skills/oxlint-effect/assets/effect4.
import { Effect } from "effect";
import * as bad from "../../skills/oxlint-effect/assets/cause-narrowing.bad";
import * as good from "../../skills/oxlint-effect/assets/cause-narrowing.good";

const original = new good.ProviderFailure({ code: 503, cause: { trace: "private fixture" } });
// REVIEW-ONLY: no current linteffect rule diagnoses this tagged cause loss.
// A matching error tag is not evidence that the original failure was retained.
export const lostCause = bad.mapProfile(Effect.fail(original));
// Clean repair: retains the exact original failure; public projection is separate.
export const retainedCause = good.mapProfile(Effect.fail(original));
// REVIEW-ONLY: this constructs, but does not sequence, the reporting Effect.
export const missedCapture = bad.captureAndMap(Effect.fail(original), () => Effect.void);
export const sequencedCapture = good.captureAndMap(Effect.fail(original), () => Effect.void);
