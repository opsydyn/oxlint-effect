// Effect 4 first-class asset; qualify against the pinned current consumer.
import { Data, Effect, Option } from "effect";
import { type ProfileUnavailable } from "./public-errors.good";

export function lookupSelection(selection: string | undefined) {
  return Effect.succeed(Option.fromNullishOr(selection));
}

export function recoverProfile(operation: Effect.Effect<string, ProfileUnavailable>) {
  return operation;
}

export class CheckoutRejectedError extends Data.TaggedError("CheckoutRejectedError")<{
  readonly reason: string;
}> {}

export function rejectCheckout(reason: string) {
  return Effect.fail(new CheckoutRejectedError({ reason }));
}
