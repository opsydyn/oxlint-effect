// Import order gap, not a repair.
export const before = Effect.fail(original).pipe(wrapGraphqlCall(), Effect.catchAll(() => Effect.succeed(42)));
import { Effect } from "effect";
import { original, wrapGraphqlCall } from "./envelope";
