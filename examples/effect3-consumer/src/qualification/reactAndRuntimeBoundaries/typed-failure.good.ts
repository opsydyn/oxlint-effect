import { Effect } from "effect";
export const original = { _tag: "Q49Failure" };
export const task = Effect.fail(original);
// Alias is a syntax gap, not endorsed error-channel policy.
import * as E from "effect/Effect";
export const alias = E.orDie(E.fail(original));
