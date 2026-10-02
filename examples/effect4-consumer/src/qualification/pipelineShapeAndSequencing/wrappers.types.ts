import { Effect } from "effect";
// @ts-expect-error Legacy zipRight is absent from current exports.
Effect.zipRight(Effect.logInfo("event"), Effect.succeed(42));
