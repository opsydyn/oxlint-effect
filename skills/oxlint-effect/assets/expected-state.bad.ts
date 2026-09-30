import { Effect } from "effect";
import { type ProfileUnavailable } from "./public-errors.good";
import { CheckoutRejectedError } from "./expected-state.good";

export function lookupSelection(selection: string | undefined) {
  if (selection === undefined) {
    // EXPECT: linteffect/no-expected-state-as-error
    // EXPECT: linteffect/no-adhoc-domain-error
    // QA: Ordinary absence is represented as a string failure; both rules apply.
    return Effect.fail("NotFound");
  }
  return Effect.succeed(selection);
}

// EXPECT: linteffect/no-early-catchall-null
// QA: Storage failures become indistinguishable from successful absence.
export function recoverProfile(operation: Effect.Effect<string, ProfileUnavailable>) {
  return Effect.catchAll(operation, () => Effect.succeed(null));
}

// EXPECT: linteffect/no-exception-domain-error
// QA: This documented expected rejection becomes a defect, not a typed failure.
export function rejectCheckout(reason: string) {
  return Effect.gen(function* () {
    throw new CheckoutRejectedError({ reason });
  });
}
