import { Effect } from "effect";
Effect.zipRight(Effect.succeed(1), Effect.succeed(42));
// @ts-expect-error current eager operator is not a legacy export.
Effect.flatMapEager(Effect.succeed(1), n => Effect.succeed(n + 41));
