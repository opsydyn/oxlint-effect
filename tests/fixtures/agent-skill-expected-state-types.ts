import { Effect, type Option } from "effect";
import { ProfileUnavailable } from "../../skills/oxlint-effect/assets/public-errors.good";
import {
  lookupSelection,
  recoverProfile,
  rejectCheckout,
  CheckoutRejectedError,
} from "../../skills/oxlint-effect/assets/expected-state.good";

const selection: Effect.Effect<Option.Option<string>, never> = lookupSelection(undefined);
const profile: Effect.Effect<string, ProfileUnavailable> = recoverProfile(Effect.succeed("profile-1"));
const checkout: Effect.Effect<never, CheckoutRejectedError> = rejectCheckout("closed");
// @ts-expect-error Absence is explicit Option data, not raw null.
const rawAbsence: Effect.Effect.Success<typeof selection> = null;
// @ts-expect-error The profile failure channel is not swallowed by a null fallback.
const swallowed: Effect.Effect<string, never> = profile;
// @ts-expect-error The expected rejection remains visible in the typed channel.
const defectOnly: Effect.Effect<never, never> = checkout;
void rawAbsence;
void swallowed;
void defectOnly;
