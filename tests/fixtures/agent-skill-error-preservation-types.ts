import { Effect } from "effect";
import { ProfileUnavailable } from "../../skills/oxlint-effect/assets/public-errors.good";
import {
  rejectProfile,
  rethrowProfile,
  observeProfile,
} from "../../skills/oxlint-effect/assets/error-preservation.good";

const failure = new ProfileUnavailable({ cause: new Error("offline") });
const rejected: Effect.Effect<never, ProfileUnavailable> = rejectProfile(failure);
const propagated: Effect.Effect<string, ProfileUnavailable> = rethrowProfile(Effect.fail(failure));
const observed: Effect.Effect<string, ProfileUnavailable> = observeProfile(Effect.fail(failure));
// @ts-expect-error The structured failure cannot be replaced with a message.
rejectProfile("offline");
// @ts-expect-error Observation does not remove the typed failure channel.
const swallowed: Effect.Effect<string, never> = observed;
// @ts-expect-error The operation still returns a profile, not successful void.
const voidResult: Effect.Effect.Success<typeof observed> = undefined;
void rejected;
void propagated;
void swallowed;
void voidResult;
