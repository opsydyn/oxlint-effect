import { Effect } from "effect";
import type { UserNotFound, UserForbidden } from "./no-error-as-public-effect-error.good";

// @ts-expect-error Generic Error cannot satisfy the tagged public contract.
export const invalid: Effect.Effect<string, UserNotFound | UserForbidden> = Effect.fail(new Error("unmodelled"));
